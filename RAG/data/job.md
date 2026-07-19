# HirePulse Pivot (AI-Powered Job Aggregator & Career Recommendation System)

HirePulse Pivot is an intelligent, AI-driven job aggregation and resume analysis platform. The system periodically scrapes job postings from external job boards, vectorizes their content, and utilizes a dual-engine RAG (Retrieval-Augmented Generation) pipeline to perform semantic job matching, resume analysis, and conversational career coaching via Gemini 2.0.

---

## 📖 Table of Contents
1. [System Fundamentals & Architecture](#1-system-fundamentals--architecture)
2. [Database Layer & SQL Migrations (Supabase + pgvector)](#2-database-layer--sql-migrations-supabase--pgvector)
3. [AI & RAG Pipeline Engineering](#3-ai--rag-pipeline-engineering)
4. [Job Scrapers & Periodic Aggregators](#4-job-scrapers--periodic-aggregators)
5. [Backend API Architecture (FastAPI)](#5-backend-api-architecture-fastapi)
6. [Interactive React Frontend Client](#6-interactive-react-frontend-client)
7. [Deployment & Configuration Guide](#7-deployment-&amp;-configuration-guide)
8. [RAG Context Reference & Keyword Index](#8-rag-context-reference--keyword-index)

---

## 1. System Fundamentals & Architecture

### The Semantic Gap in Job Search
Traditional job search boards rely on keyword matching, which fails when titles or descriptions use different terminology (e.g., matching a candidate with "Deep Learning Engineer" skills to a "Computer Vision Researcher" role). HirePulse Pivot bridges this gap using vector embeddings and semantic search.

### Hybrid RAG Design
HirePulse Pivot combines traditional metadata filtering (salary, location, job type) with dense vector retrieval:

```
[Candidate Resume (PDF/Docx)] ──► text extraction ──► Gemini Embedding (768d)
                                                            │
                                                            ▼
                                                 [Supabase Vector Store]
                                                            │
                                                            ▼
                                                 RPC: match_jobs()
                                                            │ (Cosine Similarity)
                                                            ▼
[Adzuna Job API] ──► Scrape & Vectorize (768d) ──► [Matched Job Listings]
                                                            │
                                                            ▼
[User Chat Query] ─────────────────────────────► [Gemini 2.0 Flash Lite]
                                                            │
                                                            ▼
                                                 [Structured Advice & Matches]
```

* **Core Components:**
  * **Ingestion Pipeline:** Uses `pypdf` and `python-docx` to extract text from uploads.
  * **Embedding Model:** Generates 768-dimensional embeddings using Google's `models/gemini-embedding-001`.
  * **Storage & Retrieval Engine:** Supabase PostgreSQL database with the `pgvector` extension enabled, querying via a custom remote procedure call (RPC).
  * **Inference Engine:** Uses `gemini-2.0-flash-lite` (via LangChain) to parse resumes into structured JSON profiles, analyze skill gaps, and power a career chat assistant.
  * **Communication Engine:** Automatically dispatches tailored match emails via the Resend API.

---

## 2. Database Layer & SQL Migrations (Supabase + pgvector)

HirePulse Pivot relies on Supabase for relational data storage and vector search. Below is the complete SQL schema definition, including table constraints, relational foreign keys, and vector similarity search functions.

### A. Core Database Tables

```sql
-- 1. Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Job Sources Table
CREATE TABLE job_sources (
    id SERIAL PRIMARY KEY,
    source_name VARCHAR(100) NOT NULL UNIQUE,
    source_url VARCHAR(255) NOT NULL
);

-- 3. Jobs Table (Stores Scraped Listings & Dense Vectors)
CREATE TABLE jobs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    company VARCHAR(150) NOT NULL,
    location VARCHAR(150) NOT NULL,
    salary INTEGER,
    job_type VARCHAR(50) DEFAULT 'Full-time',
    description TEXT,
    job_url TEXT NOT NULL,
    source_id INTEGER REFERENCES job_sources(id) ON DELETE CASCADE,
    embedding vector(768), -- Dense vector storage (768 dimensions for Gemini)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create HNSW Index for Faster Cosine Distance Queries
CREATE INDEX ON jobs USING hnsw (embedding vector_cosine_ops);

-- 4. Saved/Bookmarked Jobs
CREATE TABLE saved_jobs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, job_id)
);

-- 5. User Resumes Table
CREATE TABLE user_resumes (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    resume_text TEXT NOT NULL,
    embedding vector(768) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. User AI Profiles Table (Structured Parsing Outcomes)
CREATE TABLE user_ai_profiles (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    top_skills TEXT[] DEFAULT '{}',
    experience_level VARCHAR(50) DEFAULT 'fresher',
    preferred_roles TEXT[] DEFAULT '{}',
    education TEXT DEFAULT '',
    projects_summary TEXT DEFAULT '',
    job_fit_score INTEGER DEFAULT 0,
    missing_skills TEXT[] DEFAULT '{}',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Alert Preferences Table
CREATE TABLE alert_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    keyword VARCHAR(100) NOT NULL,
    location VARCHAR(100),
    min_salary INTEGER,
    email_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### B. pgvector RPC Search Function (`match_jobs`)
This PL/pgSQL function calculates the cosine similarity between an input search vector and all vectorized job listings in the database.

```sql
CREATE OR REPLACE FUNCTION match_jobs (
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id int,
  title text,
  company text,
  location text,
  salary int,
  job_type text,
  description text,
  job_url text,
  source_id int,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    jobs.id,
    jobs.title::text,
    jobs.company::text,
    jobs.location::text,
    jobs.salary,
    jobs.job_type::text,
    jobs.description::text,
    jobs.job_url::text,
    jobs.source_id,
    1 - (jobs.embedding <=> query_embedding) AS similarity
  FROM jobs
  WHERE 1 - (jobs.embedding <=> query_embedding) > match_threshold
  ORDER BY jobs.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

---

## 3. AI & RAG Pipeline Engineering

The system's AI modules are defined inside the `RAG` directory. They orchestrate document parsing, semantic vector generation, profile extraction, and career advising.

### A. Document Text Extractors
The backend accepts `.pdf` and `.docx` file formats. It extracts their content using:
* **PDFs (`pypdf`):** Loops through the document pages using `PdfReader` and extracts text from each page.
* **Word Documents (`python-docx`):** Instantiates a `Document` object and extracts text from each paragraph.

### B. Gemini Embedding Generation
The system generates 768-dimensional embeddings via `GoogleGenerativeAIEmbeddings` using `models/gemini-embedding-001`. It supports two task configurations:
1. **Document Embedding:** Generated using `embed_documents()` for chunking and database indexing.
2. **Query Embedding:** Generated using `embed_query()` to structure conversational questions for cosine matching.

### C. Resume Parsing Prompt & Model Constraints
Saves structured data into the database using a strict Pydantic model (`AIProfile`) validated via `gemini-2.0-flash-lite`:

```python
PROFILE_PROMPT = ChatPromptTemplate.from_template(
    "Extract structured data from this resume.\n\n"
    "Rules:\n"
    "- top_skills: max 8 skills\n"
    "- preferred_roles: max 5 roles\n"
    "- only extract what's mentioned.\n\n"
    "RESUME:\n{resume_text}"
)
```

If the API is offline, a local fallback scans the text against a list of 72 common technical terms (e.g., Python, AWS, React) to populate the profile.

### D. Skill Gap Analysis Prompt
Compares candidate skills against the requirements of matched job listings to calculate a match score and identify areas for improvement:

```python
ANALYSIS_PROMPT = ChatPromptTemplate.from_template(
    "Analyze this resume against the list of matched jobs.\n\n"
    "Rules:\n"
    "- matched_skills: max 6 items\n"
    "- missing_skills: max 5 items\n\n"
    "RESUME:\n{resume_text}\n\n"
    "JOBS:\n{jobs_json}"
)
```

### E. Career Coach Conversation Prompt
Powers the **HirePulse Pivot AI** conversational agent, generating career recommendations and matching job suggestions:

```python
CHAT_PROMPT = ChatPromptTemplate.from_template(
    "You are HirePulse Pivot AI, an expert career assistant. Answer the user query using the resume context, chat history, and matched jobs.\n\n"
    "RESUME CONTEXT:\n{resume}\n{missing_text}\n\n"
    "MATCHED JOBS:\n{jobs_json}\n\n"
    "VALID JOB IDs (Only match/return jobs that have these IDs!): {valid_ids}\n"
    "TOTAL AVAILABLE JOBS: {total_jobs} | SAVED JOBS: {saved_jobs_count}\n\n"
    "USER QUERY: {query}\n\n"
    "RULES:\n"
    "1. Resume/CV related questions -> Provide constructive feedback or career advice.\n"
    "2. Job recommendation/matching questions -> Identify matches from the MATCHED JOBS list, provide reasons, and return them. Never invent or hallucinate job IDs outside of the VALID JOB IDs list!\n"
    "3. If query is a general greeting or unrelated to job recommendations/matching, keep 'jobs' empty.\n"
    "4. Mention missing skills in career advice if available."
)
```

---

## 4. Job Scrapers & Periodic Aggregators

The system contains an automated job scraping module in the `scrapers/` folder.

### A. Adzuna API Scraper (`scrapers/main.py`)
Queries the **Adzuna India Job Search API** to gather local job listings.
* **Query Parameters:** Sets the location parameter to India (`in`), requests 20 results per page, and filters results by 20 distinct target keywords (such as `software developer`, `data analyst`, `project manager`).
* **Ingestion Limits:** Stops scraping once it inserts `TARGET_JOBS = 60` new listings during a run to avoid exceeding API limits.
* **Vector Indexing:** Combines the job title and description, generates an embedding vector, and saves it in the `embedding` column of the `jobs` table in Supabase.
* **De-duplication:** Skips listings if the URL matches an existing record, or if the title and company name are already present in the database.

### B. Scraper Scheduler (`scrapers/scheduler.py`)
Runs the scraper as a background daemon using `APScheduler`.
* **Execution Interval:** Scheduled to run every 4 days by default, configurable via the `SCRAPER_INTERVAL_DAYS` environment variable.
* **Scheduler Type:** Uses a `BlockingScheduler` with an `IntervalTrigger` for simple, low-overhead scheduling.

### C. Backfill Embeddings Script (`scrapers/embed_existing_jobs.py`)
A utility script that checks the database for jobs missing vector representations (`is_("embedding", "null")`), generates embeddings for them, and updates their records in Supabase.

---

## 5. Backend API Architecture (FastAPI)

The FastAPI server (`main.py`) acts as the API gateway. It handles user authentication, data aggregation, resume processing, and semantic search.

### Key API Endpoints

| Method | Endpoint | Auth | Request/Response Payload | Description |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/register` | None | `RegisterUser` / JSON details | Registers a new user. Hashes passwords using bcrypt. |
| **POST** | `/login` | None | `LoginUser` / `{ access_token, token_type }` | Authenticates credentials and returns a JWT token. |
| **GET** | `/profile` | JWT | None / `{ id, username, email }` | Returns details for the authenticated user. |
| **GET** | `/get_jobs` | JWT | Query params (`page`, `per_page`) / JSON list | Returns a paginated list of job postings. |
| **POST** | `/search_jobs` | JWT | `SearchJob` / Paginated JSON | Filters jobs by keyword, company, location, type, and minimum salary. |
| **POST** | `/save_job` | JWT | `{ job_id }` / `{ message, saved_job }` | Saves a job posting to the user's bookmarks. |
| **GET** | `/saved_jobs`| JWT | None / JSON array | Returns the list of jobs saved by the user. |
| **POST** | `/alert_preferences` | JWT | `AlertPreference` / JSON response | Saves search alert settings and sends matches using FastAPI `BackgroundTasks`. |
| **POST** | `/resume/upload` | JWT | Form-Data file / `{ message, analysis, profile }` | Parses an uploaded resume, generates embeddings, saves the profile, and returns a skill gap analysis. |
| **POST** | `/resume/chat` | JWT | `ResumeChatInput` / `{ response, matches }` | Chats with the career assistant. Performs semantic search and returns advice alongside matching jobs. |

---

## 6. Interactive React Frontend Client

The frontend is a single-page application built with React, Vite, and CSS Variables. It features a responsive layout with a dark theme and glassmorphism styling.

```
frontend/src/
├── context/
│   └── AuthContext.jsx          # Stores user JWT sessions and login states
├── services/
│   └── api.js                   # Axios wrapper for backend API endpoints
├── components/
│   ├── ProtectedRoute.jsx       # Blocks unauthorized access to system dashboards
│   ├── Navbar.jsx               # Navigation bar displaying active navigation tabs
│   └── Footer.jsx               # Simple footer component
└── pages/
    ├── LandingPage.jsx          # Public landing page with a call to action
    ├── LoginPage.jsx            # Sign-in portal with input validation
    ├── RegisterPage.jsx         # Sign-up page with error handling
    ├── DashboardPage.jsx        # Job board with filters, search, and detail views
    ├── SavedJobsPage.jsx        # Displays bookmarked job listings
    ├── AlertsPage.jsx           # Manage search alert parameters and email settings
    └── ResumePage.jsx           # Split-pane interface: upload & chat assistant
```

### Key UI Features

#### 1. Split-Pane Resume Dashboard
The `ResumePage.jsx` split interface features:
* **Left Panel (Upload & Analysis):**
  * Supports drag-and-drop file uploads for PDFs and DOCX files.
  * Shows a loading indicator during parsing.
  * Displays match metrics, identified skills, and missing skills.
  * Features a **circular water-fill animation** that fills vertically to match the computed resume match score.
* **Right Panel (HirePulse Pivot AI Chat):**
  * Displays messages in a conversational layout with scroll-to-bottom behavior.
  * Suggests matching jobs directly in the chat feed as structured cards, allowing users to save jobs or apply immediately.

#### 2. Theme Configuration
The application initializes in dark mode by default. It reads preferences from `localStorage` and applies theme attributes to the HTML element:
```javascript
document.documentElement.setAttribute('data-theme', 'dark');
```

---

## 7. Deployment & Configuration Guide

### Environment Variables (`.env`)

Save a `.env` configuration file in the project root directory:

```ini
# Server Setup
PORT=8000
HOST=127.0.0.1

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_ALGORITHM=HS256

# Supabase Credentials
SUPABASE_URL=https://your-supabase-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key-here

# Gemini AI API Key
GEMINI_API_KEY=your-gemini-api-key-here

# Resend Email API Credentials
RESEND_API_KEY=re_your_resend_api_key

# Adzuna API Credentials
ADZUNA_APP_ID=your_adzuna_app_id
ADZUNA_APP_KEY=your_adzuna_app_key
```

### Step-by-Step Installation

#### 1. Database Setup
1. Create a new project in the Supabase Dashboard.
2. In the SQL Editor, enable the `vector` extension and run the SQL migration script from the [Database Layer section](#2-database-layer--sql-migrations-supabase--pgvector) to set up tables and the similarity search function.

#### 2. Run the FastAPI Backend
1. Navigate to the root directory and install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Start the FastAPI server using Uvicorn:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

#### 3. Run the Job Scraper
* **Run Once:** Populate your database with job listings from the Adzuna API:
  ```bash
  python scrapers/main.py
  ```
* **Scheduled Runs:** Start the background scheduler:
  ```bash
  python scrapers/scheduler.py
  ```

#### 4. Run the React Frontend
1. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:5173` in your browser.

---

## 8. Document Indexing Reference (RAG Quick Reference)

This quick reference index helps LLM RAG engines map terminology and configurations:

* **Conversational AI Name:** HirePulse Pivot AI
* **LLM Engine Model:** `gemini-2.0-flash-lite`
* **Embedding Model:** `models/gemini-embedding-001` (768 dimensions)
* **Supabase RPC Function Name:** `match_jobs`
* **Relational Database Name:** Supabase PostgreSQL
* **Vector Indexing Algorithm:** HNSW (Hierarchical Navigable Small World) with cosine distance (`vector_cosine_ops`)
* **Job Ingestion Scraper Script:** `scrapers/main.py`
* **Daemon Scheduler Script:** `scrapers/scheduler.py`
* **Backfill Vector Script:** `scrapers/embed_existing_jobs.py`
* **Default Scraper Interval:** 4 days (configurable via `SCRAPER_INTERVAL_DAYS`)
* **Target Scraped Count:** 60 listings per run (`TARGET_JOBS`)
* **Core API framework:** FastAPI (Python)
* **Frontend bundler:** Vite (React SPA)
* **Default Backend Port:** `8000`
* **Default Frontend Port:** `5173`
* **Authentication Standard:** JWT (JSON Web Tokens) with HS256 encryption
* **Email notification provider:** Resend API
* **Supported file upload formats:** PDF (`pypdf`), DOCX (`python-docx`)
* **Allowed file upload size:** Up to 10MB
* **Default visual theme:** dark mode (`data-theme="dark"`)

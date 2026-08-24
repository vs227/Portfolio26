import os
import time

from dotenv import load_dotenv
load_dotenv()

# Global variables to cache model/db so we don't reload on every single query
_embeddings = None
_db = None
_llm = None

def get_vector_db(db_path: str):
    """Load FAISS vector DB using HuggingFace Inference API for embeddings."""
    from langchain_huggingface import HuggingFaceEndpointEmbeddings
    from langchain_community.vectorstores import FAISS
    global _embeddings, _db
    if _db is None:
        if not os.path.exists(db_path):
            raise FileNotFoundError(f"Vector database not found at {db_path}. Please run ingestion first.")
        _embeddings = HuggingFaceEndpointEmbeddings(
            model="sentence-transformers/all-MiniLM-L6-v2",
            task="feature-extraction",
            huggingfacehub_api_token=os.getenv("HF_TOKEN") or os.getenv("HUGGINGFACEHUB_API_TOKEN"),
        )
        _db = FAISS.load_local(db_path, _embeddings, allow_dangerous_deserialization=True)
    return _db

def get_llm():
    from langchain_groq import ChatGroq
    global _llm
    if _llm is None:
        _llm = ChatGroq(
            model_name="openai/gpt-oss-20b",
            temperature=0.2
        )
    return _llm

def query_rag(question: str, chat_history: list, db_path: str) -> str:
    from langchain_core.prompts import ChatPromptTemplate
    from langchain_core.output_parsers import StrOutputParser

    db = get_vector_db(db_path)
    llm = get_llm()
    
    # Keep history bounded to recent 6 messages (3 back-and-forth turns) to minimize token consumption
    recent_history = chat_history[-6:] if chat_history else []

    # 1. Condense follow-up questions if chat history exists
    standalone_question = question
    if recent_history:
        condense_prompt = ChatPromptTemplate.from_messages([
            ("system", (
                "Given the chat history and follow-up question, rephrase it "
                "into a standalone search query. Respond ONLY with the query."
            )),
            ("placeholder", "{chat_history}"),
            ("human", "{question}")
        ])
        condense_chain = condense_prompt | llm | StrOutputParser()
        standalone_question = condense_chain.invoke({
            "chat_history": recent_history,
            "question": question
        }).strip()

    # 2. Retrieve documents – fetch top matches and ensure project overview inclusion
    retriever = db.as_retriever(search_kwargs={"k": 8})
    docs = retriever.invoke(standalone_question)

    # Force inclusion of the project index overview chunk if asking about projects
    project_keywords = ["project", "projects", "built", "done", "portfolio", "work", "how many", "list", "created", "apps"]
    if any(kw in standalone_question.lower() for kw in project_keywords):
        overview_docs = db.similarity_search("All Projects Overview project summary list", k=1)
        if overview_docs:
            docs = overview_docs + [d for d in docs if d.page_content != overview_docs[0].page_content]

    # Deduplicate: keep at most 2 chunks per source project to avoid one project dominating
    seen: dict[str, int] = {}
    diverse_docs = []
    for doc in docs:
        label = doc.metadata.get("source_label", "unknown")
        seen[label] = seen.get(label, 0) + 1
        if seen[label] <= 2:
            diverse_docs.append(doc)

    context = "\n\n".join(doc.page_content for doc in diverse_docs)
    
    # 3. Generate response using contextual prompt
    rag_prompt = ChatPromptTemplate.from_messages([
        ("system", (
            "You are an intelligent, professional AI assistant for Vaishnav Shinde's portfolio.\n"
            "Your goal is to answer questions about Vaishnav (his skills, education, and projects) "
            "as well as handle general questions, coding queries, or greetings.\n\n"
            "FORMATTING RULES (strict):\n"
            "- You are writing inside a small chat widget. Keep responses concise and scannable.\n"
            "- Use **bold** for emphasis. Use bullet points (- item) for lists.\n"
            "- NEVER use emojis (such as 👋, 🚀, etc.) in any response.\n"
            "- NEVER use HTML tags like <br>, <b>, <table>, etc.\n"
            "- NEVER use markdown tables (| --- |). Use bullet lists instead.\n"
            "- Keep paragraphs short (2-3 sentences max). Add a blank line between sections.\n"
            "- Do NOT dump raw data. Summarise information in a friendly, human way.\n\n"
            "CONTENT RULES:\n"
            "1. Vaishnav has built 4 major projects: HirePulse Pivot (Job Aggregator), MediChain Intelligence (Blockchain Healthcare), Guard Up / IIDS (Intrusion Detection), and XAUUSD ML Framework (Market Pattern Model). Always state that he has built 4 projects when asked about his projects or project count.\n"
            "2. ALWAYS prioritize the facts in the CONTEXT over any contradictory or incorrect statements in the previous chat history.\n"
            "3. Each context chunk is tagged with a [Project: ...] label. NEVER mix details from one project into another.\n"
            "4. Do NOT use meta-phrases like 'according to the resume' or 'in the provided context'. Speak naturally as Vaishnav's assistant.\n"
            "5. If a question asks about personal details not in the context, state politely that the information is not available.\n\n"
            "CONTEXT:\n{context}"
        )),
        ("placeholder", "{chat_history}"),
        ("human", "{question}")
    ])
    
    rag_chain = rag_prompt | llm | StrOutputParser()
    response = rag_chain.invoke({
        "context": context,
        "chat_history": recent_history,
        "question": question
    })
    
    return response

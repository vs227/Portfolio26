import os
# Force Hugging Face cache to be inside the local project folder
os.environ["HF_HOME"] = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".hf_cache")
os.environ["HF_HUB_OFFLINE"] = "1"

import threading
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from langchain_core.messages import HumanMessage, AIMessage
from retrieval import query_rag, get_vector_db, get_llm

DB_PATH = "faiss_index"

# Track whether models have finished loading
_models_ready = threading.Event()

def _preload_models():
    """Load models in a background thread so the server can bind the port immediately."""
    print("Background: Preloading vector database and LLM...")
    try:
        get_vector_db(DB_PATH)
        get_llm()
        print("Background: Preloading completed successfully.")
    except Exception as e:
        print(f"Background: Failed to preload: {e}")
    finally:
        _models_ready.set()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Start preloading in a background thread so uvicorn can open the port immediately
    thread = threading.Thread(target=_preload_models, daemon=True)
    thread.start()
    yield

app = FastAPI(title="Vaishnav Shinde Portfolio RAG API", lifespan=lifespan)

# Enable CORS so the React app can communicate with the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage]

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    # Wait up to 120s for background model loading to finish
    if not _models_ready.wait(timeout=120):
        raise HTTPException(status_code=503, detail="Models are still loading, please try again shortly.")
    try:
        # Convert history format to LangChain message objects
        chat_history = []
        for msg in request.history:
            if msg.role == "user":
                chat_history.append(HumanMessage(content=msg.content))
            elif msg.role == "assistant":
                chat_history.append(AIMessage(content=msg.content))
                
        # Run query
        response = query_rag(request.message, chat_history, DB_PATH)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    return {"status": "ok", "service": "Vaishnav Shinde Portfolio RAG API"}

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "db_loaded": os.path.exists(DB_PATH)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)

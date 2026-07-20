import os
import time
# Force Hugging Face cache to be inside the local project folder
os.environ["HF_HOME"] = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".hf_cache")

import threading
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

DB_PATH = "faiss_index"

# Track whether models have finished loading
_models_ready = threading.Event()
_load_error = None

def _preload_models():
    """Load models in a background thread so the server can bind the port immediately."""
    global _load_error
    t0 = time.time()
    try:
        print(f"[preload] Starting... HF_HOME={os.environ.get('HF_HOME')}", flush=True)
        print(f"[preload] .hf_cache exists: {os.path.exists(os.environ.get('HF_HOME', ''))}", flush=True)
        print(f"[preload] faiss_index exists: {os.path.exists(DB_PATH)}", flush=True)

        print("[preload] Importing langchain modules...", flush=True)
        from langchain_core.messages import HumanMessage, AIMessage
        from retrieval import query_rag, get_vector_db, get_llm
        print(f"[preload] Imports done in {time.time()-t0:.1f}s", flush=True)

        print("[preload] Loading vector database...", flush=True)
        get_vector_db(DB_PATH)
        print(f"[preload] Vector DB loaded in {time.time()-t0:.1f}s", flush=True)

        print("[preload] Initializing LLM...", flush=True)
        get_llm()
        print(f"[preload] LLM initialized in {time.time()-t0:.1f}s", flush=True)

        print(f"[preload] ALL DONE in {time.time()-t0:.1f}s", flush=True)
    except Exception as e:
        _load_error = str(e)
        print(f"[preload] FAILED after {time.time()-t0:.1f}s: {e}", flush=True)
        import traceback
        traceback.print_exc()
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
    # Wait up to 300s for background model loading to finish
    if not _models_ready.wait(timeout=300):
        raise HTTPException(status_code=503, detail="Models are still loading, please try again shortly.")
    if _load_error:
        raise HTTPException(status_code=500, detail=f"Model loading failed: {_load_error}")
    try:
        from langchain_core.messages import HumanMessage, AIMessage
        from retrieval import query_rag
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
    ready = _models_ready.is_set()
    return {"status": "ok", "models_ready": ready, "error": _load_error}

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "db_loaded": os.path.exists(DB_PATH), "models_ready": _models_ready.is_set()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)

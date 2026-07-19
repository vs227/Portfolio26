import os
# Force Hugging Face cache to be inside the local project folder
os.environ["HF_HOME"] = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".hf_cache")

from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from langchain_core.messages import HumanMessage, AIMessage
from retrieval import query_rag, get_vector_db, get_llm

DB_PATH = "faiss_index"

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Preload the vector database and LLM at startup so that they are cached
    # and the first user query doesn't suffer from a loading/initialization delay
    print("Preloading vector database and LLM...")
    try:
        get_vector_db(DB_PATH)
        get_llm()
        print("Preloading completed successfully.")
    except Exception as e:
        print(f"Failed to preload vector database or LLM: {e}")
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

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "db_loaded": os.path.exists(DB_PATH)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)

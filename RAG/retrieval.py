import os
# Force Hugging Face cache to be inside the local project folder
os.environ["HF_HOME"] = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".hf_cache")
os.environ["HF_HUB_OFFLINE"] = "1"

from dotenv import load_dotenv
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

# Load env variables
load_dotenv()

# Global variables to cache model/db so we don't reload on every single query
_embeddings = None
_db = None
_llm = None

def get_vector_db(db_path: str):
    global _embeddings, _db
    if _db is None:
        if not os.path.exists(db_path):
            raise FileNotFoundError(f"Vector database not found at {db_path}. Please run ingestion first.")
        _embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        _db = FAISS.load_local(db_path, _embeddings, allow_dangerous_deserialization=True)
    return _db

def get_llm():
    global _llm
    if _llm is None:
        _llm = ChatGroq(
            model_name="llama-3.1-8b-instant",
            temperature=0.2
        )
    return _llm

def query_rag(question: str, chat_history: list, db_path: str) -> str:
    db = get_vector_db(db_path)
    llm = get_llm()
    
    # 1. Condense follow-up questions if chat history exists
    standalone_question = question
    if chat_history:
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
            "chat_history": chat_history,
            "question": question
        }).strip()
        
    # 2. Retrieve documents using the standalone query
    retriever = db.as_retriever(search_kwargs={"k": 4})
    docs = retriever.invoke(standalone_question)
    context = "\n\n".join(doc.page_content for doc in docs)
    
    # 3. Generate response using contextual prompt
    rag_prompt = ChatPromptTemplate.from_messages([
        ("system", (
            "You are an intelligent, professional AI assistant for Vaishnav Shinde's portfolio. "
            "Your goal is to answer questions about Vaishnav (his skills, education, and projects) "
            "as well as handle general questions, coding queries, or greetings.\n\n"
            "Guidelines:\n"
            "1. For questions about Vaishnav's qualifications, resume, or projects: Rely on the provided CONTEXT. "
            "Assume all projects described in the context are developed by Vaishnav.\n"
            "2. For general questions (greetings, explaining technical terms like Blockchain, React, YOLO, etc., or writing code snippets): "
            "Answer them intelligently using your general knowledge, keeping answers concise and professional.\n"
            "3. If a question asks about Vaishnav's personal details or work experience not mentioned in the context, "
            "politely state that the information is not available in his resume rather than hallucinating details.\n\n"
            "CONTEXT:\n{context}"
        )),
        ("placeholder", "{chat_history}"),
        ("human", "{question}")
    ])
    
    rag_chain = rag_prompt | llm | StrOutputParser()
    response = rag_chain.invoke({
        "context": context,
        "chat_history": chat_history,
        "question": question
    })
    
    return response

import os
from dotenv import load_dotenv
from dataIngestion.loader import load_documents, split_documents, build_vector_db
from retrieval import query_rag
from langchain_core.messages import HumanMessage, AIMessage

# Load env variables
load_dotenv()

DB_PATH = "faiss_index"
DATA_DIR = "data"

def run_ingestion():
    print("--- Starting Data Ingestion Pipeline ---")
    documents = load_documents(DATA_DIR)
    if not documents:
        print("No documents found to ingest.")
        return False
        
    chunks = split_documents(documents)
    build_vector_db(chunks, DB_PATH)
    print("--- Data Ingestion Pipeline Completed Successfully ---\n")
    return True

def main():
    # Automatically run ingestion if the vector store does not exist
    if not os.path.exists(DB_PATH):
        print(f"Vector database '{DB_PATH}' not found. Initializing ingestion...")
        success = run_ingestion()
        if not success:
            return
            
    print("Initializing RAG chain...")
    try:
        # Pre-load database to verify configuration
        from retrieval import get_vector_db
        get_vector_db(DB_PATH)
        
        print("RAG Pipeline is ready!")
        print("Type 'exit' or 'quit' to stop.\n")
        
        chat_history = []
        
        while True:
            query = input("Ask a question about the resume or projects: ").strip()
            if not query:
                continue
            if query.lower() in ['exit', 'quit']:
                break
                
            print("\nAnswering...")
            response = query_rag(query, chat_history, DB_PATH)
            print(f"Answer:\n{response}\n")
            print("-" * 50)
            
            # Update chat history
            chat_history.append(HumanMessage(content=query))
            chat_history.append(AIMessage(content=response))
            
            # Keep sliding window of last 6 messages to optimize token usage
            if len(chat_history) > 6:
                chat_history = chat_history[-6:]
            
    except Exception as e:
        print(f"Error during execution: {e}")

if __name__ == "__main__":
    main()
import os
from pathlib import Path
from langchain_community.document_loaders import PyMuPDFLoader, PyPDFLoader, TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS

def load_documents(data_dir: str):
    documents = []
    data_path = Path(data_dir)
    
    if not data_path.exists():
        print(f"Data directory {data_dir} does not exist.")
        return documents

    for file_path in data_path.iterdir():
        if file_path.suffix == '.pdf':
            print(f"Loading PDF: {file_path.name}")
            try:
                loader = PyMuPDFLoader(str(file_path))
                documents.extend(loader.load())
            except Exception as e:
                print(f"PyMuPDF failed to load {file_path.name}: {e}. Retrying with PyPDFLoader...")
                try:
                    loader = PyPDFLoader(str(file_path))
                    documents.extend(loader.load())
                except Exception as ex:
                    print(f"Failed to load PDF {file_path.name} with both loaders: {ex}")
        elif file_path.suffix == '.md':
            print(f"Loading Markdown: {file_path.name}")
            loader = TextLoader(str(file_path), encoding='utf-8')
            documents.extend(loader.load())
            
    print(f"Loaded {len(documents)} documents.")
    return documents

def split_documents(documents, chunk_size=800, chunk_overlap=100):
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        separators=["\n\n", "\n", " ", ""]
    )
    chunks = text_splitter.split_documents(documents)
    print(f"Split documents into {len(chunks)} chunks.")
    return chunks

def build_vector_db(chunks, db_path: str):
    print("Initializing HuggingFace Embeddings (all-MiniLM-L6-v2)...")
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    
    print("Building FAISS index...")
    db = FAISS.from_documents(chunks, embeddings)
    
    print(f"Saving FAISS index to {db_path}...")
    db.save_local(db_path)
    return db

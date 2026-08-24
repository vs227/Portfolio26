import os
# Force Hugging Face cache to be inside the local project folder
os.environ["HF_HOME"] = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".hf_cache")

from pathlib import Path
from langchain_community.document_loaders import PyMuPDFLoader, PyPDFLoader, TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS

# Map filenames to friendly project labels
SOURCE_LABELS = {
    "project_index.md": "All Projects Overview",
    "job.md": "Project: HirePulse Pivot (Job Aggregator)",
    "blockchain_healthcare.md": "Project: MediChain Intelligence (Blockchain Healthcare)",
    "intrusion.md": "Project: Guard Up / IIDS (Intrusion Detection)",
    "market.md": "Project: XAUUSD ML Framework (Market Pattern Model)",
    "vs_resume.pdf": "Vaishnav Shinde Resume",
}

def load_documents(data_dir: str):
    documents = []
    data_path = Path(data_dir)
    
    if not data_path.exists():
        print(f"Data directory {data_dir} does not exist.")
        return documents

    for file_path in data_path.iterdir():
        label = SOURCE_LABELS.get(file_path.name, file_path.stem)
        if file_path.suffix == '.pdf':
            print(f"Loading PDF: {file_path.name}")
            try:
                loader = PyMuPDFLoader(str(file_path))
                docs = loader.load()
            except Exception as e:
                print(f"PyMuPDF failed to load {file_path.name}: {e}. Retrying with PyPDFLoader...")
                try:
                    loader = PyPDFLoader(str(file_path))
                    docs = loader.load()
                except Exception as ex:
                    print(f"Failed to load PDF {file_path.name} with both loaders: {ex}")
                    docs = []
            for doc in docs:
                doc.metadata["source_label"] = label
            documents.extend(docs)
        elif file_path.suffix == '.md':
            print(f"Loading Markdown: {file_path.name}")
            loader = TextLoader(str(file_path), encoding='utf-8')
            docs = loader.load()
            for doc in docs:
                doc.metadata["source_label"] = label
            documents.extend(docs)
            
    print(f"Loaded {len(documents)} documents.")
    return documents

def split_documents(documents, chunk_size=1200, chunk_overlap=150):
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        separators=["\n---\n", "\n\n", "\n", " ", ""]
    )
    chunks = text_splitter.split_documents(documents)
    # Prefix each chunk with its source project label for retrieval clarity
    for chunk in chunks:
        label = chunk.metadata.get("source_label", "")
        if label:
            chunk.page_content = f"[{label}]\n{chunk.page_content}"
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

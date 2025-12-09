import os
from .store import VectorStore
from .stores.sqlite_store import SQLiteVectorStore
from ..config import get_database_url

def get_vector_store(url: str = None) -> VectorStore:
    """
    Create the VectorStore based on the database connection URL.
    """
    if url is None:
        url = get_database_url()

    # SQLite
    # `sqlite:...` or file paths
    if url.startswith("sqlite:") or ("://" not in url):
        db_path = url
        
        if url.startswith("sqlite:///"):
            db_path = url.replace("sqlite:///", "")
        elif url.startswith("sqlite:"):
            db_path = url.replace("sqlite:", "")
        
        if not db_path:
            db_path = "feedback_embeddings.db"

        return SQLiteVectorStore(db_path)

    # Other db implemenrations...

    # Unknown
    raise ValueError(f"Unsupported database connection URL: {url}")

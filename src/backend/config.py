import os


# Default settings
DEFAULT_RAG_DATABASE_URL = "sqlite:///feedback_embeddings.db"
DEFAULT_FEEDBACK_LOG_PATH = "feedback_log.jsonl"

# Environment variable names
ENV_RAG_DATABASE_URL = "RAG_DATABASE_URL"
ENV_FEEDBACK_LOG_PATH = "FEEDBACK_LOG_PATH"

def get_database_url() -> str:
    """Get the database URL from env or default"""
    return os.getenv(ENV_RAG_DATABASE_URL, DEFAULT_RAG_DATABASE_URL)

def get_feedback_log_path() -> str:
    """Get the feedback log path from env or default"""
    return os.getenv(ENV_FEEDBACK_LOG_PATH, DEFAULT_FEEDBACK_LOG_PATH)

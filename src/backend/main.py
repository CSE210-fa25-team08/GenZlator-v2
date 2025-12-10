import os
from fastapi import FastAPI
from src.backend.utils.prompt_manager import PromptManager
from src.backend.core.rag_lite import RAGLiteSystem
from src.backend.vectorization.store_factory import get_vector_store
from src.backend.config import get_database_url, get_feedback_log_path

# Import routers
from src.backend.api import translation_router as translation
from src.backend.api import feedback_router as feedback
from src.backend.api import debug_router as debug
from src.backend.api import health_check_router as health
from src.backend.api import models_router as models
from fastapi.middleware.cors import CORSMiddleware

FEEDBACK_LOG_PATH = get_feedback_log_path()
RAG_DATABASE_URL = get_database_url()

# Create FastAPI app
app = FastAPI(
    title="Emoji Translator Backend",
    version="1.0.0",
    description="Core Translation & Feedback APIs powered by OpenRouter with model racing.",
)
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize shared components
prompt_manager = PromptManager("./prompts/prompts.json")

# Initialize RAG system with vector store injection
vector_store = get_vector_store(RAG_DATABASE_URL)
rag_system = RAGLiteSystem(store=vector_store)

# Initialize dependencies in routers
translation.init_dependencies(prompt_manager, rag_system)
feedback.init_dependencies(rag_system)
debug.init_dependencies(rag_system)
health.init_dependencies(prompt_manager, rag_system)


# Register routers
app.include_router(translation.router)
app.include_router(feedback.router)
app.include_router(debug.router)
app.include_router(health.router)
app.include_router(models.router)


@app.on_event("startup")
async def startup_event():
    """Initialize RAG system with existing feedback data on application startup"""
    rag_system.load_feedback_from_jsonl(FEEDBACK_LOG_PATH)


@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Emoji Translator Backend API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/healthz",
    }

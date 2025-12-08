import os
import sqlite3
from datetime import datetime
from fastapi import APIRouter
from fastapi.responses import JSONResponse

# Create router instance
router = APIRouter(tags=["health"])

# Shared dependencies
prompt_manager = None
rag_system = None
FEEDBACK_LOG_PATH = os.getenv("FEEDBACK_LOG_PATH", "feedback_log.jsonl")


@router.get("/healthz")
async def health_check():
    """
    Basic health check endpoint for load balancers and monitoring systems.

    Performs lightweight checks on core system components:
    - Database connectivity
    - Prompt system initialization
    - File system access

    Returns HTTP 200 if healthy, 503 if degraded/unhealthy.
    """
    try:
        # Check if feedback log file exists
        feedback_log_exists = os.path.exists(FEEDBACK_LOG_PATH)

        # Test RAG database connectivity (lightweight check)
        rag_db_accessible = True
        try:
            conn = sqlite3.connect(rag_system.db_path)
            conn.execute("SELECT 1")  # Simple connectivity test
            conn.close()
        except Exception:
            rag_db_accessible = False

        # Check if prompts are loaded
        prompts_loaded = bool(prompt_manager.prompts)

        # Determine overall health status
        is_healthy = all([rag_db_accessible, prompts_loaded])

        return JSONResponse(
            content={
                "status": "healthy" if is_healthy else "degraded",
                "timestamp": datetime.utcnow().isoformat(),
                "checks": {
                    "rag_database": "ok" if rag_db_accessible else "error",
                    "prompts": "ok" if prompts_loaded else "error",
                    "feedback_log": "ok" if feedback_log_exists else "warning",
                },
            },
            status_code=200 if is_healthy else 503,
        )
    except Exception as e:
        return JSONResponse(
            content={
                "status": "unhealthy",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat(),
            },
            status_code=503,
        )


def init_dependencies(pm, rs):
    """Initialize shared dependencies"""
    global prompt_manager, rag_system
    prompt_manager = pm
    rag_system = rs

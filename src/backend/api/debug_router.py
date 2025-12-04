import sqlite3
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel

# Create router instance
router = APIRouter(prefix="/debug", tags=["debug"])

# Shared dependencies
rag_system = None


def serialize_numpy_types(obj):
    """Helper function to serialize numpy types if needed"""
    import numpy as np

    if isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.floating):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, dict):
        return {k: serialize_numpy_types(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [serialize_numpy_types(i) for i in obj]
    else:
        return obj
    raise TypeError("Type not serializable")


class DebugRAGSearchRequest(BaseModel):
    text: str


@router.get("/rag")
async def debug_rag():
    """
    Debug endpoint to retrieve RAG system statistics and recent feedback entries.

    Returns:
        - Total number of feedback records in the database
        - Last 5 recent feedback entries with original input, correction, and rating
        - System configuration information
    """
    try:
        conn = sqlite3.connect(rag_system.db_path)
        cursor = conn.cursor()

        # Get total count of feedback records
        cursor.execute("SELECT COUNT(*) FROM feedback_embeddings")
        total_records = cursor.fetchone()[0]

        # Get recent feedback entries (use created_at instead of timestamp)
        cursor.execute(
            """
            SELECT original_input, correction_text, rating 
            FROM feedback_embeddings 
            ORDER BY created_at DESC 
            LIMIT 5
        """
        )
        recent_records = cursor.fetchall()
        conn.close()

        return JSONResponse(
            {
                "status": "ok",
                "total_feedbacks": total_records,
                "similarity_threshold": rag_system.similarity_threshold,
                "max_similar_examples": rag_system.max_similar_examples,
                "recent_feedbacks": [
                    {"originalInput": r[0], "correctionText": r[1], "rating": r[2]}
                    for r in recent_records
                ],
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to retrieve RAG data: {str(e)}"
        )


@router.post("/rag/search")
async def debug_rag_search(request: DebugRAGSearchRequest):
    """
    Debug endpoint to test RAG similarity search functionality.

    Args:
        request: Contains the text query to search for similar feedback entries

    Returns:
        - The original query text
        - Number of similar examples found
        - List of similar feedback entries with similarity scores
        - RAG system configuration details
    """
    query_text = request.text

    if not query_text:
        print("Debug RAG Search: Missing 'text' field in request body")
        raise HTTPException(
            status_code=400, detail="Missing 'text' field in request body"
        )

    try:
        # Perform similarity search using RAG system
        similar_feedbacks = rag_system.find_similar_feedbacks(query_text)
        serialized_feedbacks = serialize_numpy_types(similar_feedbacks)

        return JSONResponse(
            {
                "status": "ok",
                "query": query_text,
                "found_examples": len(similar_feedbacks),
                "similarity_threshold": float(rag_system.similarity_threshold),
                "similar_feedbacks": serialized_feedbacks,
                "rag_config": {
                    "max_examples": rag_system.max_similar_examples,
                    "database_path": rag_system.db_path,
                },
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to search RAG data: {str(e)}"
        )


def init_dependencies(rs):
    """Initialize shared dependencies"""
    global rag_system
    rag_system = rs

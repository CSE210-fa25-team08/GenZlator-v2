import os
import json
from datetime import datetime
from fastapi import APIRouter, HTTPException
from models import FeedbackRequest, FeedbackResponse

# Create router instance  
router = APIRouter(prefix="/api/v1", tags=["feedback"])

# Shared dependencies
rag_system = None
FEEDBACK_LOG_PATH = os.getenv("FEEDBACK_LOG_PATH", "feedback_log.jsonl")

@router.post("/feedback", response_model=FeedbackResponse, status_code=202)
async def submit_feedback(req: FeedbackRequest):
    """
    Enhanced Feedback API with RAG integration
    
    - Stores feedback in JSONL format for offline analysis
    - Adds feedback to RAG system for future similarity matching
    - Returns 202 Accepted on success
    """
    feedback_record = {
        "timestamp": datetime.utcnow().isoformat(),
        "originalInput": req.originalInput,
        "correctionText": req.correctionText,
        "anonymousId": req.anonymousId,
        "rating": req.rating,
    }
    
    try:
        # Save to JSONL file for backup/offline analysis
        with open(FEEDBACK_LOG_PATH, "a", encoding="utf-8") as f:
            f.write(json.dumps(feedback_record, ensure_ascii=False) + "\n")
        
        # Add to RAG system for immediate use
        rag_system.add_feedback(
            original_input=req.originalInput,
            correction_text=req.correctionText,
            anonymous_id=req.anonymousId,
            rating=req.rating,
            timestamp=feedback_record["timestamp"]
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to store feedback: {str(e)}"
        )
    
    return FeedbackResponse(status="accepted")

def init_dependencies(rs):
    """Initialize shared dependencies"""
    global rag_system
    rag_system = rs
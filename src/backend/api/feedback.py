import os
import json
from datetime import datetime
from fastapi import APIRouter, HTTPException
from core.models import FeedbackRequest, FeedbackResponse

router = APIRouter(prefix="/api/v1", tags=["feedback"])

FEEDBACK_LOG_PATH = os.getenv("FEEDBACK_LOG_PATH", "feedback_log.jsonl")


@router.post("/feedback", response_model=FeedbackResponse, status_code=202)
async def submit_feedback(req: FeedbackRequest):
    feedback_record = {
        "timestamp": datetime.datetime().isoformat(),
        "originalInput": req.originalInput,
        "correctionText": req.correctionText,
        "anonymousId": req.anonymousId,
        "rating": req.rating,
    }

    try:
        with open(FEEDBACK_LOG_PATH, "a", encoding="utf-8") as f:
            f.write(json.dumps(feedback_record, ensure_ascii=False) + "\n")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to store feedback: {str(e)}")

    return FeedbackResponse(status="accepted")

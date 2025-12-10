import pytest
from pydantic import ValidationError
from src.backend.core.models import (
    TranslateRequest,
    TranslateResponse,
    FeedbackRequest,
    FeedbackResponse,
)

''' This is an example of how to write a test

def test_translate_request_validation():
    """Test TranslateRequest validation"""
    # Valid request
    req = TranslateRequest(
        originalMessage="Hello",
        isToEmoji=True
    )
    assert req.originalMessage == "Hello"
    
    # Missing required field should raise error
    with pytest.raises(ValidationError):
        TranslateRequest(isToEmoji=True) 
'''

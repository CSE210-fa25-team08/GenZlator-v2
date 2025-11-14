from typing import List, Optional
from pydantic import BaseModel, Field


class TranslateRequest(BaseModel):
    originalMessage: str = Field(
        ...,
        description="The text or emoji chain to be translated.",
    )
    isToEmoji: bool = Field(
        ...,
        description="true = Text→Emoji (encoding); false = Emoji→Text (decoding).",
    )
    chatHistory: Optional[List[str]] = Field(
        default=None,
        description="Optional array of recent messages for contextual translation.",
    )


class TranslateResponseMetadata(BaseModel):
    tone: Optional[str] = Field(
        default=None,
        description='Assessed emotional tone (e.g., "Extreme Laughter", "Mild Sarcasm").',
    )


class TranslateResponse(BaseModel):
    translatedMessage: str
    metadata: TranslateResponseMetadata


class FeedbackRequest(BaseModel):
    originalInput: str = Field(
        ...,
        description="Original text/emoji input that triggered translation.",
    )
    correctionText: str = Field(
        ...,
        description="User-provided correct/suggested translation.",
    )
    anonymousId: Optional[str] = Field(
        default=None,
        description="Anonymous identifier used to track the source of the feedback.",
    )
    rating: Optional[int] = Field(
        default=None,
        description="Anonymous score provided by user (e.g., 1–5).",
    )


class FeedbackResponse(BaseModel):
    status: str = "accepted"

from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime


class TranslateRequest(BaseModel):
    originalMessage: str = Field(
        ...,
        description="The text or emoji chain to be translated.",
    )
    isToEmoji: bool = Field(
        ...,
        description="true = Text→Emoji (encoding); false = Emoji→Text (decoding).",
    )
    model_id: Optional[str] = Field(
        default=None,
        description="Optional model ID to be passed for translate model selection",
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


class UserHistoryRequest(BaseModel):
    user_id: str
    limit: Optional[int] = 10
    offset: Optional[int] = 0


class TranslationHistoryItem(BaseModel):
    timestamp: datetime
    original_message: str
    translated_message: str
    is_to_emoji: bool
    rating: Optional[int] = None


class UserHistoryResponse(BaseModel):
    user_id: str
    total_count: int
    translations: List[TranslationHistoryItem]


class UserRegisterRequest(BaseModel):
    username: str
    email: Optional[str] = None
    preferences: Optional[dict] = {}


class UserRegisterResponse(BaseModel):
    user_id: str
    username: str
    created_at: datetime
    status: str


class ModelInfo(BaseModel):
    model_id: str
    name: str
    description: str
    is_free: bool
    max_tokens: Optional[int] = None
    provider: str


class ModelsResponse(BaseModel):
    models: List[ModelInfo]
    total_count: int

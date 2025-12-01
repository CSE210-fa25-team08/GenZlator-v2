from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from api.translate import router as translate_router
from api.feedback import router as feedback_router

app = FastAPI(
    title="Emoji Translator Backend",
    version="1.0.0",
    description="Core Translation & Feedback APIs powered by OpenRouter with model racing.",
)

# List of allowable frontend origins
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(translate_router)
app.include_router(feedback_router)


@app.get("/healthz")
async def health_check():
    return JSONResponse({"status": "ok"})

from fastapi import FastAPI
from fastapi.responses import JSONResponse

from api.translate import router as translate_router
from api.feedback import router as feedback_router

app = FastAPI(
    title="Emoji Translator Backend",
    version="1.0.0",
    description="Core Translation & Feedback APIs powered by OpenRouter with model racing.",
)

app.include_router(translate_router)
app.include_router(feedback_router)


@app.get("/healthz")
async def health_check():
    return JSONResponse({"status": "ok"})
                                       
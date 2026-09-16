from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from app.core.config import settings
from app.api.v1.api import api_router
import app.db.base  # Ensures all models are imported and registered

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set all CORS enabled origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.get("/update_url")
def update_url(url: str):
    settings.BACKEND_URL = url
    return {"status": "updated", "new_url": settings.BACKEND_URL}

@app.get("/ready")
def readiness_check():
    return {"status": "ready"}

@app.get("/terms", response_class=HTMLResponse)
async def terms():
    return "<html><body><h1>Terms of Service</h1><p>Test terms</p></body></html>"

@app.get("/privacy", response_class=HTMLResponse)
async def privacy():
    return "<html><body><h1>Privacy Policy</h1><p>Test privacy</p></body></html>"
import os

@app.get("/{filename}.txt")
async def tiktok_verification(filename: str):
    try:
        with open("tiktok_sig.txt", "r") as f:
            sig = f.read().strip()
        return HTMLResponse(content=sig, media_type="text/plain")
    except Exception:
        return HTMLResponse(content="tiktok-developers-site-verification=unknown", media_type="text/plain")
@app.get("/", response_class=HTMLResponse)
async def home():
    return "<html><body><h1>ContentRadar API</h1></body></html>"

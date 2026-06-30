import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from routers import generation, webhooks

# ============================================================
# 1. SETUP LOGGING
# ============================================================
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("main")

# ============================================================
# 2. INITIALIZE FASTAPI APPLICATION
# ============================================================
app = FastAPI(
    title="OpenReel Multi-Model Video Generation API",
    description="Microservice for cinematic prompt enhancement and video generation orchestrations (Phase 2).",
    version="1.0.0"
)

# ============================================================
# 3. CONFIGURE CORS MIDDLEWARE
# ============================================================
# Allows interaction with Next.js frontend or other microservices
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production based on requirements
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# 4. REGISTER ROUTERS
# ============================================================
app.include_router(generation.router, prefix="/api/v1")
app.include_router(webhooks.router, prefix="/api/v1")

# ============================================================
# 5. HEALTH CHECK / ROOT ENDPOINT
# ============================================================
@app.get("/")
async def root():
    return {
        "status": "online",
        "service": "OpenReel Generative AI Microservice",
        "version": "1.1.0",
        "adapters": [
            "Seedance 2.0 (Fal.ai)", 
            "Kling AI", 
            "Google Gemini 1.5 Flash",
            "Google Imagen 3.0",
            "Nano Banana (Gemini 3.1 Flash Image)"
        ]
    }



if __name__ == "__main__":
    import uvicorn
    # Start the server locally
    logger.info("Starting OpenReel FastAPI server...")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

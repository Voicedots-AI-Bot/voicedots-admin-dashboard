from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import asyncio
from app.config import settings
from app.routes import register_routers
from app.routes.dependencies import get_elevenlabs_client
from app.helpers.kpi_aggregator import aggregate_conversations
from app.jwt_auth_middleware import JWTAuthMiddleware


app = FastAPI(
    title="Voicedots Admin Backend",
    description="Backend API for providing admin dashboard services",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# ---------------------------
# CORS
# ---------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173","https://voicedots.io","https://*.io"],  # Update with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(JWTAuthMiddleware)  # Authentication middleware

# ---------------------------
# ROUTERS
# ---------------------------
register_routers(app)

# ---------------------------
# KPI BACKGROUND AGGREGATOR
# ---------------------------
@app.on_event("startup")
async def start_kpi_aggregator():
    """
    Automatically aggregates KPIs in background.
    Runs every 1 hour.
    """
    client = get_elevenlabs_client()

    async def run_loop():
        while True:
            try:
                await aggregate_conversations(client, settings.AGENT_ID)
            except Exception as e:
                print("KPI Aggregator Error:", e)

            #  Run every 1 hour 
            await asyncio.sleep(3600)

    asyncio.create_task(run_loop())

# ---------------------------
# BASIC ROUTES
# ---------------------------
@app.get("/", tags=["root"])
def read_root():
    return {
        "message": "Voicedots Admin Backend",
        "status": "running",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc"
    }

@app.get("/health", tags=["health"])
def health_check():
    return {"status": "healthy"}

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import asyncio
from app.models.users_db import User
from app.config.database import AsyncSessionLocal
from sqlalchemy import select
from app.routes import register_routers
from app.routes.dependencies import get_elevenlabs_client
from app.helpers.kpi_aggregator import aggregate_conversations
from app.jwt_auth_middleware import JWTAuthMiddleware
from app.config.database import engine
from app import models

# models.Base.metadata.create_all(bind=engine)

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
    Check for db tables.
    Automatically aggregates KPIs in background.
    Runs every 1 hour.
    """
    
    async with engine.begin() as conn:
        await conn.run_sync(models.Base.metadata.create_all)
    
    client = get_elevenlabs_client()

    async def run_loop():
        while True:
            try:
                async with AsyncSessionLocal() as db:
                    result = await db.execute(select(User.agent_id))
                    agent_ids = result.scalars().all()

                    for agent_id in agent_ids:
                        await aggregate_conversations(client, agent_id, db)
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

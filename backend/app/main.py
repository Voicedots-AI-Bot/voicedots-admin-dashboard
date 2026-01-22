from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import register_routers

app = FastAPI(
    title="Voicedots Admin Backend",
    description="Backend API for providing admin dashboard services",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_routers(app)

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

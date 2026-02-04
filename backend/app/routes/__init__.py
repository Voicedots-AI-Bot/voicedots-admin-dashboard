from fastapi import FastAPI
from app.routes.v1.conversations import router as conversation
from app.routes.v1.leads import router as leads
from app.routes.v1.auth import router as auth
def register_routers(app: FastAPI):
    app.include_router(auth)
    app.include_router(conversation)
    app.include_router(leads)
    pass
from fastapi import FastAPI
from app.routes.v1.conversations import router as conversation

def register_routers(app: FastAPI):
    # app.include_router(auth)
    app.include_router(conversation)
    pass
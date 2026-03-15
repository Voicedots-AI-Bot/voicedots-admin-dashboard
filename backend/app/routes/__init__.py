from fastapi import FastAPI
from app.routes.v1.conversations import router as conversation
from app.routes.v1.kpi import router as kpi
from app.routes.v1.leads import router as leads
from app.routes.v1.ticket import router as ticket
from app.routes.v1.demo import router as demo
from app.routes.v1.auth import router as auth
from app.routes.v1.ticket import router as ticket
from app.routes.v1.users import router as users
def register_routers(app: FastAPI):
    app.include_router(auth)
    app.include_router(conversation)
    app.include_router(kpi)
    app.include_router(leads)
    app.include_router(ticket)
    app.include_router(users)
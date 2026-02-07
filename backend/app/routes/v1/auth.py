from fastapi import APIRouter, Form

from app.config.jwt_auth import jwt_auth
from app.helpers.jwt_helper import hash_password

router = APIRouter(prefix="/v1/auth", tags=["auth"])

fake_users_db = {
    "admin@gmail.com": {
        "username": "admin",
        "hashed_password": hash_password("Ind123Ind@"),
    }
}

@router.post("/login", summary="Login", description="Authenticate user and return JWT token")
async def login(
    email: str = Form(...),
    password: str = Form(...),
):
    user = fake_users_db.get(email)
    return jwt_auth.login(email, password, user)

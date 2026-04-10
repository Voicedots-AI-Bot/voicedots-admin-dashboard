from fastapi import APIRouter, Form, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.config.database import get_db
from app.config.jwt_auth import jwt_auth
from app.helpers.jwt_helper import hash_password
from app.models.users_db import User
from app.config.logger import get_logger

logger = get_logger("AuthRouter")

router = APIRouter(prefix="/v1/auth", tags=["auth"])

@router.post("/login", summary="Login", description="Authenticate user and return JWT token")
async def login(
    email: str = Form(...),
    password: str = Form(...),
    db: AsyncSession = Depends(get_db)
):
    try:
        result = await db.execute(
            select(User).where(User.email == email)
        )
        user = result.scalar_one_or_none()
        
        print(f"DEBUG: Login attempt for {email}")
        if user:
            print(f"DEBUG: User found. DB Hash prefix: {user.hashed_password[:10]}")
        else:
            print(f"DEBUG: User NOT found in V1 database.")
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        return jwt_auth.login(password, user)
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Unexpected error during login")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.post("/generate_hashpassword", summary="Hash Password", description="Convert your password into hash password")
async def login(
    password: str = Form(...),
):
    try:
        hashed_password = hash_password(password)
        return {"hashed_password": hashed_password}
    except Exception as e:
        logger.exception("Unexpected error during generation")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )
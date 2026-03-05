from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.config.database import get_db
from app.models.users_db import User
from app.schemas.users_schema import UserResponse, UserUpdateRequest, PasswordUpdateRequest
from app.config.logger import get_logger
from app.helpers.jwt_helper import verify_password, hash_password
import uuid

logger = get_logger("UsersRouter")

router = APIRouter(prefix="/v1/users", tags=["users"])

@router.get("/me", response_model=UserResponse, summary="Get Current User", description="Fetch current user's details")
async def get_me(request: Request, db: AsyncSession = Depends(get_db)):
    try:
        user_id = request.state.user.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Unauthorized")
            
        result = await db.execute(select(User).where(User.user_id == uuid.UUID(user_id)))
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
            
        response_dict = {
            "user_id": str(user.user_id),
            "name": user.name,
            "email": user.email,
            "profile_picture": user.profile_picture
        }
        return response_dict
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        logger.exception("Unexpected error fetching user")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.put("/me", response_model=UserResponse, summary="Update Current User", description="Update name, email, or profile picture")
async def update_me(payload: UserUpdateRequest, request: Request, db: AsyncSession = Depends(get_db)):
    try:
        user_id = request.state.user.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Unauthorized")
            
        result = await db.execute(select(User).where(User.user_id == uuid.UUID(user_id)))
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
            
        # Verify password for sensitive updates
        if payload.name is not None or payload.email is not None:
            if not verify_password(payload.current_password, user.hashed_password):
                raise HTTPException(status_code=401, detail="Invalid current password")
                
        if payload.name is not None:
            user.name = payload.name
        if payload.email is not None:
            user.email = payload.email
        if payload.profile_picture is not None:
            user.profile_picture = payload.profile_picture
            
        await db.commit()
        await db.refresh(user)
        return {
            "user_id": str(user.user_id),
            "name": user.name,
            "email": user.email,
            "profile_picture": user.profile_picture
        }
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.exception("Unexpected error updating user")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.put("/me/password", summary="Update Password", description="Change current user password securely")
async def update_password(payload: PasswordUpdateRequest, request: Request, db: AsyncSession = Depends(get_db)):
    try:
        user_id = request.state.user.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Unauthorized")
            
        result = await db.execute(select(User).where(User.user_id == uuid.UUID(user_id)))
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
            
        if not verify_password(payload.current_password, user.hashed_password):
            raise HTTPException(status_code=401, detail="Invalid current password")
            
        user.hashed_password = hash_password(payload.new_password)
        await db.commit()
        
        return {"status": "success", "message": "Password updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.exception("Unexpected error updating password")
        raise HTTPException(status_code=500, detail="Internal server error")

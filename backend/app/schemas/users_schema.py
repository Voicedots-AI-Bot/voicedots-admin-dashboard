from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID

class UserResponse(BaseModel):
    user_id: UUID
    name: str
    email: str
    profile_picture: Optional[str] = None
    agent_id: Optional[str] = None
    
    class Config:
        from_attributes = True

class UserUpdateRequest(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    profile_picture: Optional[str] = None
    current_password: Optional[str] = None

class PasswordUpdateRequest(BaseModel):
    current_password: str
    new_password: str

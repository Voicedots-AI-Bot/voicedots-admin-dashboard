import asyncio
from sqlalchemy import select
from app.config.database import AsyncSessionLocal
from app.models.users_db import User
from app.schemas.users_schema import UserResponse
from uuid import UUID

async def test_schemas():
    async with AsyncSessionLocal() as db:
        user_id = "7090dfed-b711-4763-80e8-9f7f1cca10a2"
        result = await db.execute(select(User).where(User.user_id == UUID(user_id)))
        user = result.scalar_one_or_none()
        
        if user:
            print("User Object Fetch OK.")
            
            payload = {
                "user_id": str(user.user_id),
                "name": user.name,
                "email": user.email,
                "profile_picture": user.profile_picture
            }
            try:
                response = UserResponse(**payload)
                print("Serialize OK:", response.model_dump())
            except Exception as e:
                print("Serialize FAILED:", e)
        else:
            print("No users found")

if __name__ == "__main__":
    asyncio.run(test_schemas())

import asyncio
from sqlalchemy import select
from app.config.database import AsyncSessionLocal
from app.models.users_db import User

async def test_db():
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User))
        user = result.scalars().first()
        if user:
            print(f"Found user: {user.user_id} - {type(user.user_id)}")
            print(f"Email: {user.email}")
            print(f"Name: {user.name}")
        else:
            print("No users found")

if __name__ == "__main__":
    asyncio.run(test_db())

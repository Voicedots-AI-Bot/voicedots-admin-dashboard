import asyncio
from sqlalchemy import text
from app.config.database import engine

async def run_migration():
    async with engine.begin() as conn:
        try:
            await conn.execute(text("ALTER TABLE users ADD COLUMN profile_picture VARCHAR;"))
            print("Successfully added profile_picture column to users table.")
        except Exception as e:
            if "already exists" in str(e):
                print("Column already exists.")
            else:
                print("Error adding column:", str(e))

if __name__ == "__main__":
    asyncio.run(run_migration())

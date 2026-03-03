import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import sys

# Windows requires this for ProactorEventLoop when cleaning up asyncpg sessions
if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

async def main():
    engine = create_async_engine("postgresql+asyncpg://postgres:0909@localhost:5432/voicedots")
    async with engine.connect() as conn:
        result = await conn.execute(text("SELECT user_id, email, name FROM users"))
        for row in result:
            print(f"ID: {row[0]}, Email: {row[1]}, Name: {row[2]}")
            
if __name__ == "__main__":
    asyncio.run(main())

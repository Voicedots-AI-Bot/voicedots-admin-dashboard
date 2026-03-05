import asyncio
import httpx
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from app.helpers.jwt_helper import create_access_token
import sys

if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

async def main():
    engine = create_async_engine("postgresql+asyncpg://postgres:0909@localhost:5432/voicedots")
    async with engine.connect() as conn:
        result = await conn.execute(text("SELECT user_id, email, name FROM users LIMIT 1"))
        row = result.fetchone()
        if not row:
            print("No user found")
            return
            
        user_id = str(row[0])
        email = row[1]
        name = row[2]
        print(f"DB User: id={user_id}, email={email}, name={name}")
        
    token_payload = {
        "sub": user_id,
        "email": email,
        "username": name,
    }
    token = create_access_token(token_payload)
    print(f"Generated Token: {token[:20]}...")
    
    async with httpx.AsyncClient() as client:
        headers = {"Authorization": f"Bearer {token}"}
        resp = await client.get("http://localhost:8000/v1/users/me", headers=headers)
        print("Status Code:", resp.status_code)
        print("Response:", resp.text)

if __name__ == "__main__":
    asyncio.run(main())

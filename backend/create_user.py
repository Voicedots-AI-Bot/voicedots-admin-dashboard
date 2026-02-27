import uuid
import asyncio
from getpass import getpass
from sqlalchemy.exc import IntegrityError
from passlib.context import CryptContext
from app.models.users_db import User
from app.config.database import AsyncSessionLocal


pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

# -------------------------
# Create User Function
# -------------------------
async def create_user():
    async with AsyncSessionLocal() as db:
        try:
            print("=== Create New User ===")

            email = input("Enter email: ").strip()
            name = input("Enter name: ").strip()
            agent_id = input("Enter agent_id (must be unique): ").strip()
            password = getpass("Enter password: ")

            if not email or not name or not agent_id or not password:
                print("All fields are required.")
                return

            hashed_password = hash_password(password)

            new_user = User(
                user_id=uuid.uuid4(),  # optional if default in model
                email=email,
                name=name,
                agent_id=agent_id,
                hashed_password=hashed_password
            )

            db.add(new_user)
            await db.commit()
            await db.refresh(new_user)

            print("\nUser created successfully!")
            print(f"User ID: {new_user.user_id}")

        except IntegrityError:
            await db.rollback()
            print("\nError: agent_id already exists or unique constraint failed.")

        except Exception as e:
            await db.rollback()
            print(f"\nUnexpected error: {e}")


if __name__ == "__main__":
    asyncio.run(create_user())
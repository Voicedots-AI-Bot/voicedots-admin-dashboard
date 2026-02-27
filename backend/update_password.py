import asyncio
from getpass import getpass

from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from passlib.context import CryptContext

from app.models.users_db import User
from app.config.database import AsyncSessionLocal


pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


# -------------------------
# Update Password Function
# -------------------------
async def update_password():
    async with AsyncSessionLocal() as db:
        try:
            print("=== Update User Password ===")

            identifier = input("Enter email or agent_id: ").strip()

            if not identifier:
                print("Identifier is required.")
                return

            # Find user by email OR agent_id
            result = await db.execute(
                select(User).where(
                    (User.email == identifier) |
                    (User.agent_id == identifier)
                )
            )

            user = result.scalar_one_or_none()

            if not user:
                print("User not found.")
                return

            new_password = getpass("Enter new password: ")
            confirm_password = getpass("Confirm new password: ")

            if new_password != confirm_password:
                print("Passwords do not match.")
                return

            user.hashed_password = hash_password(new_password)

            await db.commit()
            await db.refresh(user)

            print("\nPassword updated successfully.")

        except SQLAlchemyError as e:
            await db.rollback()
            print(f"\nDatabase error: {e}")

        except Exception as e:
            await db.rollback()
            print(f"\nUnexpected error: {e}")


if __name__ == "__main__":
    asyncio.run(update_password())
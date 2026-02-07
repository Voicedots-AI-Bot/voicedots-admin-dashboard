from datetime import datetime, timedelta, timezone
from typing import Dict, Optional

from jose import jwt, JWTError, ExpiredSignatureError
from passlib.context import CryptContext
from fastapi.responses import JSONResponse
from fastapi import status, Request

# ---------------- SETTINGS ----------------
SECRET_KEY = "secret"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE = timedelta(hours=24)

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

# ---------------- PASSWORD ----------------
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(password: str, hashed: str) -> bool:
    return pwd_context.verify(password, hashed)

# ---------------- JWT ----------------
def create_access_token(
    payload: Dict,
    expires_delta: Optional[timedelta] = None,
) -> str:
    to_encode = payload.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or ACCESS_TOKEN_EXPIRE
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str):
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

    except ExpiredSignatureError:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"detail": "Token expired"},
        )

    except JWTError:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"detail": "Invalid token"},
        )

# ---------------- REQUEST ----------------
def extract_bearer_token(request: Request) -> Optional[str]:
    auth = request.headers.get("Authorization")
    if not auth or not auth.startswith("Bearer "):
        return None
    return auth.split(" ", 1)[1].strip()

from datetime import datetime, timedelta, timezone
from typing import Optional
from urllib import response
from fastapi import APIRouter, Depends, Form, HTTPException, status, Request
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordBearer, SecurityScopes
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from app.config.logger import get_logger
from pydantic import EmailStr

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")  # Login endpoint


SECRET_KEY = "secret" 
ALGORITHM = "HS256"

logger = get_logger("Auth")
router = APIRouter(prefix="/v1/auth", tags=["auth"])
db = None
fake_users_db = {
    "admin@gmail.com": {
        "username": "admin",
        "hashed_password": pwd_context.hash("Ind123Ind@"),  # Change this!
        "password": "Ind123Ind@",
    }
}

@router.post("/",
    # response_model=ConversationListResponse,
    summary="Authenticate User",
    description="Checking Request coming whether from genuine user"
)
async def verify_user(
    email : EmailStr = Form(...),
    password: str = Form(...)
):
    try:
        logger.info(f"Authenticating User: {email} {password}")
        if not db:
            data = fake_users_db
            if not email in data.keys() :
                raise HTTPException(
                    status_code=404,
                    detail="Invalid Username or Password"
                )
            if not pwd_context.verify(password, data[email]["hashed_password"]):
                print(data[email]["hashed_password"] , get_password_hash(password),sep="\n---")
                raise HTTPException(
                    status_code=401,
                    detail="Invalid Username or Password "
                )
            user_token = create_access_token(data)
            response = JSONResponse(content={
                "token":user_token,
                "message" : "Logged In Successfully"
            })
            response.set_cookie(key="token", value=user_token, httponly=True)
            
            logger.info(f"Successfully Logged IN")
            return response
    except HTTPException as http_exc:
        logger.error(f"HTTP Exception during authentication: {http_exc.detail}")
        raise http_exc
    except Exception as e:
        logger.error(f"Exception during authentication: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Internal Server Error"
        )



# Password utilities
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

# JWT utilities
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(days=1))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode,SECRET_KEY,ALGORITHM)

# def create_refresh_token(data: dict):
#     expire = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
#     return create_access_token(data, expires_delta=expire)
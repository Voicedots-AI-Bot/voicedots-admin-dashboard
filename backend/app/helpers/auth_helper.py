from jose import jwt, JWTError, ExpiredSignatureError
from fastapi import HTTPException, status
from app.config.logger import get_logger
from app.routes.v1.auth import SECRET_KEY, ALGORITHM

logger = get_logger("AuthHelper")

def verify_jwt_token(token: str) -> dict:
    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )
        print(payload)
        # Optional: validate required claims
        user_id = payload.keys()
        if user_id is []:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload"
            )

        return payload

    except ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired"
        )

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

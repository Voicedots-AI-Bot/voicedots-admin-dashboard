from typing import Dict
from fastapi import HTTPException
from fastapi.responses import JSONResponse
from fastapi import status, Request

from app.helpers.jwt_helper import (
    verify_password,
    create_access_token,
    decode_token,
    extract_bearer_token,
)


class JWTAuth:
    """
    Auth service layer
    Calls helper functions only
    """

    def login(self, password: str, user: Dict):
        if not user:
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": "Invalid email or password"},
            )

        if not verify_password(password, user.hashed_password):
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": "Invalid email or password"},
            )

        token_payload = {
            "sub": str(user.user_id),   
            "email": user.email,        
            "username": user.name,
        }

        token = create_access_token(token_payload)

        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "access_token": token,
                "token_type": "bearer",
            },
        )

    def authenticate_request(self, request: Request):
        token = extract_bearer_token(request)

        if not token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authorization header missing",
            )

        payload = decode_token(token)

        if not payload or "sub" not in payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
            )

        return payload


# singleton instance (same as elevenlabs_client)
jwt_auth = JWTAuth()

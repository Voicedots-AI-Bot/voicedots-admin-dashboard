from typing import Dict
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

    def login(self, email: str, password: str, user: Dict):
        if not user:
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": "Invalid email or password"},
            )

        if not verify_password(password, user["hashed_password"]):
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": "Invalid email or password"},
            )

        token_payload = {
            "sub": email,
            "username": user.get("username"),
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
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": "Authorization header missing"},
            )

        payload = decode_token(token)

        if isinstance(payload, JSONResponse):
            return payload

        if "sub" not in payload:
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": "Invalid token payload"},
            )

        return payload


# singleton instance (same as elevenlabs_client)
jwt_auth = JWTAuth()

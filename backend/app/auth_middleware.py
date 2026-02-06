from typing import Optional
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request, HTTPException

from app.helpers.auth_helper import verify_jwt_token

class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.url.path in ["/v1/auth/", "/docs", "/redoc"]:
            return await call_next(request)

        auth_header: Optional[str] = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ", 1)[1].strip()
        if not token:
            return JSONResponse(status_code=401, content={"detail": "Unauthorized"})
        # Here you would typically verify the token and extract user info
        payload = verify_jwt_token(token)
        return await call_next(request)

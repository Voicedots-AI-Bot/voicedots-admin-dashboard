from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi.responses import JSONResponse

from app.config.jwt_auth import jwt_auth

EXEMPT_PATHS = {
    "/v1/auth/login",
    "/docs",
    "/redoc",
    "/openapi.json",
}

class JWTAuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.method == "OPTIONS":
            return await call_next(request)
        
        if request.url.path in EXEMPT_PATHS:
            return await call_next(request)

        result = jwt_auth.authenticate_request(request)

        if isinstance(result, JSONResponse):
            return result

        request.state.user = result
        return await call_next(request)

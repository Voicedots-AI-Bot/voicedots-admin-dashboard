from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi.responses import JSONResponse

from app.config.jwt_auth import jwt_auth

EXEMPT_PATHS = {
    "/",
    "/health",
    "/v1/auth/login",
    "/v1/auth/generate_hashpassword",
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

        try:
            result = jwt_auth.authenticate_request(request)
            request.state.user = result
        except HTTPException as exc:
            return JSONResponse(
                status_code=exc.status_code,
                content={"detail": exc.detail},
            )

        return await call_next(request)

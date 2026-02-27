from fastapi import Request, HTTPException, Header
import hmac
import hashlib
import json
from app.config.settings import settings
from app.config.logger import get_logger

logger = get_logger("HMCA Verifier")

async def verify_multi_tenant_signature(
    request: Request, 
    elevenlabs_signature: str = Header(None)
):
    if not elevenlabs_signature:
        raise HTTPException(status_code=401, detail="No signature header")

    # Parse the header (format is t=12345,v0=hash)
    try:
        parts = dict(item.split("=") for item in elevenlabs_signature.split(","))
        timestamp = parts.get("t")
        signature_to_verify = parts.get("v0")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid signature header format")

    if not timestamp or not signature_to_verify:
        raise HTTPException(status_code=401, detail="Missing timestamp or v0 in header")

    body_bytes = await request.body()
    
    try:
        payload = json.loads(body_bytes)
    except Exception:
        logger.error(f"Invalid payload - {payload}")
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    signed_payload = f"{timestamp}.".encode() + body_bytes
    specific_secret = settings.WEBHOOK_SECRET

    # Calculate the HMAC
    digest = hmac.new(
        specific_secret.encode(),
        msg=signed_payload,
        digestmod=hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(digest, signature_to_verify):
        logger.error("Invalid signature")
        raise HTTPException(status_code=401, detail="Invalid signature for this agent")

    request.state.payload = payload
    return True
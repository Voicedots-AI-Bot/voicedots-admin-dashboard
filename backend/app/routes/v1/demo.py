from fastapi import APIRouter, HTTPException, Header
from app.config.logger import get_logger
from app.schemas.ticket_schema import DemoRequest
from app.config.settings import settings

logger = get_logger("DemoRouter")

router = APIRouter(
    prefix="/v1/demo",
    tags=["Demo"]
)

# -------------------------------------------------------------------
# List Tickets
# -------------------------------------------------------------------

@router.post(
    "/verify-student",
    summary="Verify Student",
    description="Checks whether the student exists (Webhook endpoint for ElevenLabs)",
)
async def verify_student(
    payload: DemoRequest,
    x_webhook_secret: str = Header(...),
):
    try:
        # 🔐 Secret validation
        if x_webhook_secret != settings.WEBHOOK_SECRET:
            raise HTTPException(
                status_code=401,
                detail="Unauthorized request",
            )

        student_id = payload.student_id.strip()

        # Validate format
        if not student_id.isalnum():
            return {
                "success": False,
                "reason": "Invalid student ID format"
            }

        # Check existence
        if student_id in settings.STUDENTS_IDS:
            return {
                "success": True,
                "student_exists": True
            }
        else:
            return {
                "success": True,
                "student_exists": False
            }

    except HTTPException:
        raise

    except Exception as e:
        # Log error in production
        raise HTTPException(
            status_code=500,
            detail="Internal server error",
        )
            
        
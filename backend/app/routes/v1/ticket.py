from fastapi import APIRouter, HTTPException, Query, Request, Depends, Header
import uuid
from app.config.logger import get_logger
from app.config.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.ticket_db import Ticket
from app.config.settings import settings
from app.schemas.ticket_schema import TicketCreateRequest
from sqlalchemy import select

logger = get_logger("TicketRouter")

router = APIRouter(
    prefix="/v1/ticket",
    tags=["Ticket"]
)

# -------------------------------------------------------------------
# List Tickets
# -------------------------------------------------------------------

@router.get(
    "/",
    summary="List raised tickets",
    description="Retrieve all raised tickets",
)
async def list_tickets(
    db: AsyncSession = Depends(get_db),
):
    try:
        query = select(Ticket)
        result = await db.execute(query)
        
        tickets = result.scalars().all()

        data = [
            {
                "ticket_id": str(ticket.ticket_id),
                "name": ticket.name,
                "email": ticket.email,
                "mobile": ticket.mobile,
                "category": ticket.category,
                "sub_category": ticket.sub_category,
                "description": ticket.description,
                "status": ticket.status
            }
            for ticket in tickets
        ]

        return {
            "status": "success",
            "data": data,
        }

    except Exception as e:
        logger.exception(f"Unexpected error fetching tickets - {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch tickets",
        )
        
# -------------------------------------------------------------------
# Update Ticket Status
# -------------------------------------------------------------------

@router.post(
    "/update_ticket_status/{ticket_id}",
    summary="Update tickets status",
    description="Toggle the ticket status from open to close",
)
async def update_ticket_status(
    ticket_id: uuid.UUID,
    status: str = Query(..., description="New status for the ticket"),
    db: AsyncSession = Depends(get_db),
):
    try:
        query = select(Ticket).where(
            Ticket.ticket_id == ticket_id
        )
        result = await db.execute(query)
        ticket = result.scalar_one_or_none()

        if not ticket:
            raise HTTPException(
                status_code=404,
                detail="Ticket not found",
            )

        ticket.status = status

        await db.commit()
        await db.refresh(ticket)

        return {
            "status": "success",
            "ticket_id": str(ticket.ticket_id),
            "new_status": ticket.status,
        }

    except Exception as e:
        await db.rollback()
        logger.exception(f"Unexpected error fetching tickets - {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch tickets",
        )

# -------------------------------------------------------------------
# Save Ticket
# -------------------------------------------------------------------

@router.post(
    "/raise_ticket",
    summary="Save raised ticket",
    description="Save the ticket raised by the agent",
)
async def save_ticket(
    payload: TicketCreateRequest,
    # x_webhook_secret: str = Header(...),
    # user_id: str = Header(...),
    db: AsyncSession = Depends(get_db),
):
    try:
        # if x_webhook_secret != settings.WEBHOOK_SECRET:
        #     raise HTTPException(
        #         status_code=401,
        #         detail="Unauthorised request",
        #     )
        
        student_id = payload.student_id.strip()

        # Check existence
        if student_id not in settings.STUDENTS_IDS:
             raise HTTPException(
                status_code=404,
                detail="Student ID doesn't exist"
            )
            
        logger.info(payload)
        
        new_ticket = Ticket(
            ticket_id=uuid.uuid4(),
            user_id=uuid.UUID(payload.user_id),
            name=payload.name,
            email=payload.email,
            mobile=payload.mobile,
            category=payload.category,
            sub_category=payload.sub_category,
            description=payload.description,
            status="open"
        )

        db.add(new_ticket)
        await db.commit()
        await db.refresh(new_ticket)

        return {
            "status": "success",
            "new_ticket": str(new_ticket.ticket_id),
        }

    except HTTPException:
        raise

    except Exception as e:
        logger.exception(f"Unexpected error while saving ticket - {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save ticket for user_id {payload.user_id}",
        )
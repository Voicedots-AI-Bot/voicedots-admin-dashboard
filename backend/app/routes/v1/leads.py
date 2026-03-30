from fastapi import APIRouter, HTTPException, Query, Request, Depends
from typing import Optional
from app.config.logger import get_logger
from app.helpers.hmac_verifier import verify_multi_tenant_signature
from app.config.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.users_db import User
from app.models.leads_db import Lead
from sqlalchemy import select
from app.helpers.lead_helper import is_valid, extract
import uuid

logger = get_logger("LeadsRouter")

router = APIRouter(
    prefix="/v1/leads",
    tags=["Leads"]
)

# -------------------------------------------------------------------
# List Leads
# -------------------------------------------------------------------

@router.get(
    "/",
    summary="List leads",
    description="Retrieve all leads",
)
async def list_leads(
    request: Request,
    status: Optional[str] = Query(default=None),
    db: AsyncSession = Depends(get_db),
):
    try:
        user = request.state.user
        user_id = uuid.UUID(user["sub"])
        
        result = await db.execute(
            select(User.agent_id).where(User.user_id == user_id)
        )
        agent_id = result.scalar_one_or_none()

        query = select(Lead).where(
            Lead.agent_id == agent_id,
            # Only include leads that have at least one piece of contact info
            (Lead.name.isnot(None)) | (Lead.email.isnot(None)) | (Lead.mobile.isnot(None))
        )

        if status:
            query = query.where(Lead.status.ilike(status))

        result = await db.execute(query)
        leads = result.scalars().all()

        data = [
            {
                "lead_id": str(lead.lead_id),
                "conversation_id": lead.conversation_id,
                "agent_id": lead.agent_id,
                "name": lead.name,
                "email": lead.email,
                "mobile": lead.mobile,
                "business_description": lead.business_description,
                "status": getattr(lead, "status", None),
            }
            for lead in leads
        ]

        return {
            "status": "success",
            "data": data,
        }

    except Exception as e:
        logger.exception(f"Unexpected error fetching leads - {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch leads",
        )

# -------------------------------------------------------------------
# Get Lead Details
# -------------------------------------------------------------------

@router.get(
    "/{conversation_id}",
    summary="Get lead details",
    description="Retrieve a single lead using conversation_id",
)
async def get_lead_details(
    conversation_id: str,
    db: AsyncSession = Depends(get_db),
):
    try:
        result = await db.execute(
            select(Lead).where(Lead.conversation_id == conversation_id)
        )
        lead = result.scalar_one_or_none()

        if not lead:
            raise HTTPException(
                status_code=404,
                detail="Lead not found",
            )

        data = {
            "lead_id": str(lead.lead_id),
            "conversation_id": lead.conversation_id,
            "agent_id": lead.agent_id,
            "name": lead.name,
            "email": lead.email,
            "mobile": lead.mobile,
            "business_description": lead.business_description,
            "status": getattr(lead, "status", None),
        }

        return {
            "status": "success",
            "data": data,
        }

    except HTTPException:
        raise

    except Exception as e:
        logger.exception(f"Unexpected error fetching lead - {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch lead {conversation_id}",
        )


# -------------------------------------------------------------------
# Save Lead Details
# -------------------------------------------------------------------

@router.post(
    "/save_lead",
    summary="Save lead details",
    description="Post call webhook which saves the leads detail in db.",
    dependencies=[Depends(verify_multi_tenant_signature)],
)
async def save_lead_details(request: Request, db: AsyncSession = Depends(get_db)):
    try:
        data = request.state.payload

        lead_data = (
            data.get("data", {})
                .get("analysis", {})
                .get("data_collection_results")
        )

        if not lead_data:
            return {"status": "success", "message": "No lead data found"}

        agent_id = data.get("data", {}).get("agent_id")
        conversation_id = data.get("data", {}).get("conversation_id")

        name = extract(lead_data, "name")
        email = extract(lead_data, "email")
        mobile = extract(lead_data, "mobile")
        business_description = extract(lead_data, "description")

        # Validate agent exists
        result = await db.execute(
            select(User).where(User.agent_id == agent_id)
        )
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(status_code=404, detail="Invalid agent_id")

        if not is_valid(email) and not is_valid(mobile):
            if not is_valid(name):
                return
            status = "Unqualified"
        else:
            status = "Qualified"

        new_lead = Lead(
            agent_id=agent_id,
            conversation_id=conversation_id,
            name=name,
            email=email,
            mobile=mobile,
            business_description=business_description,
            status=status
        )

        db.add(new_lead)
        await db.commit()

        return {"status": "success", "message": "Lead saved successfully"}

    except HTTPException:
        raise

    except Exception as e:
        await db.rollback()
        logger.exception(f"Unexpected error while saving lead, {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# -------------------------------------------------------------------
# Update Lead Status
# -------------------------------------------------------------------

@router.patch(
    "/{conversation_id}/status",
    summary="Update lead status",
    description="Update the status of a lead using conversation_id",
)
async def update_lead_status(
    conversation_id: str,
    payload: dict,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    try:
        user = request.state.user
        user_id = uuid.UUID(user["sub"])
        
        # Get user's agent_id to ensure ownership
        result = await db.execute(
            select(User.agent_id).where(User.user_id == user_id)
        )
        agent_id = result.scalar_one_or_none()

        new_status = payload.get("status")
        if not new_status:
            raise HTTPException(status_code=400, detail="Status is required")

        # Find the lead and verify ownership
        result = await db.execute(
            select(Lead).where(
                Lead.conversation_id == conversation_id,
                Lead.agent_id == agent_id
            )
        )
        lead = result.scalar_one_or_none()

        if not lead:
            raise HTTPException(
                status_code=404,
                detail="Lead not found or access denied",
            )

        lead.status = new_status
        await db.commit()

        return {
            "status": "success",
            "message": f"Lead status updated to {new_status}",
            "data": {
                "conversation_id": conversation_id,
                "status": new_status
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.exception(f"Error updating lead status - {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to update lead status",
        )

# -------------------------------------------------------------------
# Delete Lead
# -------------------------------------------------------------------

@router.delete(
    "/{conversation_id}",
    summary="Delete lead",
    description="Delete a lead using conversation_id",
)
async def delete_lead(
    conversation_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    try:
        user = request.state.user
        user_id = uuid.UUID(user["sub"])
        
        # Get user's agent_id to ensure ownership
        result = await db.execute(
            select(User.agent_id).where(User.user_id == user_id)
        )
        agent_id = result.scalar_one_or_none()

        # Find the lead and verify ownership
        result = await db.execute(
            select(Lead).where(
                Lead.conversation_id == conversation_id,
                Lead.agent_id == agent_id
            )
        )
        lead = result.scalar_one_or_none()

        if not lead:
            raise HTTPException(
                status_code=404,
                detail="Lead not found or access denied",
            )

        await db.delete(lead)
        await db.commit()

        return {
            "status": "success",
            "message": "Lead deleted successfully"
        }

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.exception(f"Error deleting lead - {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to delete lead",
        )
from fastapi import APIRouter, HTTPException, Query, Request, Depends
from typing import Optional
from app.config.logger import get_logger
from app.helpers.hmac_verifier import verify_multi_tenant_signature
from app.config.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.users_db import User
from app.models.leads_db import Lead
from sqlalchemy import select, cast, Date, func
from app.helpers.lead_helper import is_valid, extract
import uuid
from datetime import date

logger = get_logger("LeadsRouter")
router = APIRouter(prefix="/v1/leads", tags=["Leads"])

def format_lead(lead: Lead):
    return {
        "lead_id": str(lead.lead_id),
        "conversation_id": lead.conversation_id,
        "agent_id": lead.agent_id,
        "name": lead.name,
        "email": lead.email,
        "mobile": lead.mobile,
        "business_description": lead.business_description,
        "status": getattr(lead, "status", None),
        "created_at": lead.created_at.isoformat() if lead.created_at and hasattr(lead.created_at, "isoformat") else None,
    }

@router.get("/", summary="List leads")
async def list_leads(
    request: Request,
    status: Optional[str] = Query(default=None),
    start_date: Optional[str] = Query(default=None),
    end_date: Optional[str] = Query(default=None),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=50, ge=1, le=100000),
    db: AsyncSession = Depends(get_db),
):
    try:
        user_id = uuid.UUID(request.state.user["sub"])
        result = await db.execute(select(User.agent_id).where(User.user_id == user_id))
        agent_id = result.scalar_one_or_none()

        query = select(Lead).where(
            Lead.agent_id == agent_id,
            (Lead.name.isnot(None)) | (Lead.email.isnot(None)) | (Lead.mobile.isnot(None))
        )

        if status:
            query = query.where(Lead.status.ilike(status))

        for d_str, op in [(start_date, ">="), (end_date, "<=")]:
            if d_str:
                try:
                    d = date.fromisoformat(d_str[:10])
                    query = query.where(cast(Lead.created_at, Date) >= d if op == ">=" else cast(Lead.created_at, Date) <= d)
                except ValueError:
                    logger.warning(f"Invalid date format: {d_str}")

        # Counts
        total_count = (await db.execute(select(func.count()).select_from(query.subquery()))).scalar_one()
        qualified_count = (await db.execute(select(func.count()).select_from(query.where(Lead.status.ilike("Qualified")).subquery()))).scalar_one()

        # Data
        result = await db.execute(query.order_by(Lead.created_at.desc()).offset((page - 1) * limit).limit(limit))
        leads = result.scalars().all()

        return {
            "status": "success",
            "data": [format_lead(l) for l in leads],
            "pagination": {
                "total": total_count, "qualified": qualified_count,
                "page": page, "limit": limit,
                "pages": (total_count + limit - 1) // limit if total_count > 0 else 0
            }
        }
    except Exception as e:
        logger.exception(f"Error fetching leads: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch leads")

@router.get("/{conversation_id}", summary="Get lead details")
async def get_lead_details(conversation_id: str, db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(select(Lead).where(Lead.conversation_id == conversation_id))
        lead = result.scalar_one_or_none()
        if not lead:
            raise HTTPException(status_code=404, detail="Lead not found")

        return {"status": "success", "data": format_lead(lead)}
    except HTTPException: raise
    except Exception as e:
        logger.exception(f"Error fetching lead: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch lead")

@router.post("/save_lead", summary="Save lead", dependencies=[Depends(verify_multi_tenant_signature)])
async def save_lead_details(request: Request, db: AsyncSession = Depends(get_db)):
    try:
        payload = request.state.payload
        data = payload.get("data", {})
        lead_data = data.get("analysis", {}).get("data_collection_results")

        if not lead_data:
            return {"status": "success", "message": "No lead data found"}

        agent_id = data.get("agent_id")
        conversation_id = data.get("conversation_id")
        
        name = extract(lead_data, "name")
        email = extract(lead_data, "email")
        mobile = extract(lead_data, "mobile")
        
        if not any([is_valid(name), is_valid(email), is_valid(mobile)]):
            return {"status": "success", "message": "Insufficient data to save lead"}

        # Ownership check
        if not (await db.execute(select(User).where(User.agent_id == agent_id))).scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Invalid agent_id")

        status = "Qualified" if is_valid(email) or is_valid(mobile) else "Unqualified"
        
        db.add(Lead(
            agent_id=agent_id, conversation_id=conversation_id,
            name=name, email=email, mobile=mobile,
            business_description=extract(lead_data, "description"),
            status=status
        ))
        await db.commit()
        return {"status": "success", "message": "Lead saved"}
    except HTTPException: raise
    except Exception as e:
        await db.rollback()
        logger.exception(f"Error saving lead: {e}")
        raise HTTPException(status_code=500, detail="Internal error")

@router.patch("/{conversation_id}/status", summary="Update status")
async def update_lead_status(conversation_id: str, payload: dict, request: Request, db: AsyncSession = Depends(get_db)):
    try:
        user_id = uuid.UUID(request.state.user["sub"])
        agent_id = (await db.execute(select(User.agent_id).where(User.user_id == user_id))).scalar_one_or_none()
        
        new_status = payload.get("status")
        if not new_status:
            raise HTTPException(status_code=400, detail="Status required")

        lead = (await db.execute(select(Lead).where(Lead.conversation_id == conversation_id, Lead.agent_id == agent_id))).scalar_one_or_none()
        if not lead:
            raise HTTPException(status_code=404, detail="Lead not found")

        lead.status = new_status
        await db.commit()
        return {"status": "success", "message": f"Updated to {new_status}"}
    except HTTPException: raise
    except Exception as e:
        await db.rollback()
        logger.exception(f"Error updating status: {e}")
        raise HTTPException(status_code=500, detail="Update failed")

@router.delete("/{conversation_id}", summary="Delete lead")
async def delete_lead(conversation_id: str, request: Request, db: AsyncSession = Depends(get_db)):
    try:
        user_id = uuid.UUID(request.state.user["sub"])
        agent_id = (await db.execute(select(User.agent_id).where(User.user_id == user_id))).scalar_one_or_none()
        
        lead = (await db.execute(select(Lead).where(Lead.conversation_id == conversation_id, Lead.agent_id == agent_id))).scalar_one_or_none()
        if not lead:
            raise HTTPException(status_code=404, detail="Lead not found")

        await db.delete(lead)
        await db.commit()
        return {"status": "success", "message": "Lead deleted"}
    except HTTPException: raise
    except Exception as e:
        await db.rollback()
        logger.exception(f"Error deleting lead: {e}")
        raise HTTPException(status_code=500, detail="Delete failed")
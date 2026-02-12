from fastapi import APIRouter, Request, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.config.database import get_db
import uuid
from app.config.logger import get_logger
from app.helpers.kpi_helper import get_kpis, get_kpis_with_timeseries


logger = get_logger("KPIRouter")

router = APIRouter(
    prefix="/v1/kpis",
    tags=["KPIs"]
)

# --------------------------------------------------
# KPI SUMMARY + TIMESERIES (FOR GRAPHS)
# --------------------------------------------------
@router.get(
    "/",
    summary="Get KPI summary + timeseries",
    description="Return KPI summary and daily timeseries for graphs"
)
async def get_kpis_full(request: Request, db: AsyncSession = Depends(get_db)):
    try:
        user_id = uuid.UUID(request.state.user["sub"])
        results = await get_kpis_with_timeseries(user_id, db)
        return results

    except Exception:
        logger.exception("Failed to fetch KPI timeseries")

        return {
            "summary": {
                "total_conversations": 0,
                "total_messages": 0,
                "total_cost_usd": 0,
                "avg_cost_per_conversation_usd": 0,
                "total_call_duration_secs": 0,
                "avg_call_duration_secs": 0,
            },
            "timeseries": [],
        }

# --------------------------------------------------
# KPI SUMMARY (SAFE + CORRECT SCHEMA)
# --------------------------------------------------
@router.get(
    "/summary",
    summary="Get KPI summary",
    description="Return aggregated KPI metrics for dashboard"
)
async def get_kpi_summary(request: Request, db: AsyncSession = Depends(get_db)):
    try:
        user_id = uuid.UUID(request.state.user["sub"])
        results = await get_kpis(user_id, db)
        return results

    except Exception:
        logger.exception("Failed to fetch KPI summary")

        # ✅ EXACT schema frontend expects
        return {
            "total_conversations": 0,
            "total_messages": 0,
            "total_cost_usd": 0,
            "avg_cost_per_conversation_usd": 0,
            "total_call_duration_secs": 0,
            "avg_call_duration_secs": 0,
        }


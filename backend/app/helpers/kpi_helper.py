from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
import sqlalchemy
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime, timezone, timedelta
from app.models.usage_db import Usage
from app.models.conversation_details_db import ConversationDetails
from app.models.leads_db import Lead
from app.config.constants import PRICE_PER_1000_CREDITS
from uuid import UUID
from app.config.logger import get_logger
from decimal import Decimal

logger = get_logger("KPI-Helper")
IST = timezone(timedelta(hours=5, minutes=30))

async def add_conversation_kpi(
    db: AsyncSession,
    user_id: UUID,
    conversation_id: str,
    llm_charge: int,
    call_charge: int,
    messages_count: int,
    call_duration_hours: float = 0,
    start_time_unix_secs: int | None = None,
):
    try:
        # Check if conversation already exists
        result = await db.execute(
            select(ConversationDetails).where(
                ConversationDetails.conversation_id == conversation_id
            )
        )
        if result.scalar_one_or_none():
            return

        credits_used = llm_charge + call_charge
        cost_usd = Decimal(str((credits_used / 1000) * PRICE_PER_1000_CREDITS))
        
        dt = (
            datetime.fromtimestamp(start_time_unix_secs, IST)
            if start_time_unix_secs
            else datetime.now(IST)
        )

        conversation = ConversationDetails(
            user_id=user_id,
            conversation_id=conversation_id,
            timestamp=dt.strftime("%I:%M %p"),
            date=dt.strftime("%d %b %Y"),
            cost_credits=credits_used,
            cost_usd=cost_usd,
            call_duration_hours=call_duration_hours,
            messages_count=messages_count,
        )
        db.add(conversation)
        
        # Update usage
        usage_result = await db.execute(
            select(Usage).where(Usage.user_id == user_id)
        )
        usage = usage_result.scalar_one_or_none()

        if not usage:
            usage = Usage(
                user_id=user_id,
                total_conversations=0,
                total_messages=0,
                total_credits=0,
                total_cost_usd=Decimal("0"),
                total_call_duration_hours=Decimal("0"),
            )
            db.add(usage)

        usage.total_conversations += 1
        usage.total_messages += messages_count
        usage.total_credits += credits_used
        usage.total_cost_usd += cost_usd
        usage.total_call_duration_hours += Decimal(str(call_duration_hours))

        await db.commit()

    except SQLAlchemyError as e:
        await db.rollback()
        logger.error(f"Database error adding conversation KPI: {e}")
        raise

async def get_kpis(user_id: UUID, db: AsyncSession):
    try:
        result = await db.execute(select(Usage).where(Usage.user_id == user_id))
        usage = result.scalar_one_or_none()
        if not usage:
            return {
                "total_conversations": 0, "total_messages": 0, "total_cost_usd": 0,
                "avg_cost_per_conversation_usd": 0, "total_call_duration_secs": 0, "avg_call_duration_secs": 0,
            }

        tc = usage.total_conversations or 0
        dur_secs = int((usage.total_call_duration_hours or 0) * 3600)
        return {
            "total_conversations": tc,
            "total_messages": usage.total_messages or 0,
            "total_cost_usd": usage.total_cost_usd or 0,
            "avg_cost_per_conversation_usd": round(usage.total_cost_usd / tc, 2) if tc > 0 else 0,
            "total_call_duration_secs": dur_secs,
            "avg_call_duration_secs": int(dur_secs / tc) if tc > 0 else 0,
        }
    except SQLAlchemyError:
        logger.error("Database error fetching KPI summary")
        raise

async def get_kpis_with_timeseries(user_id: UUID, db: AsyncSession):
    try:
        result = await db.execute(
            select(
                ConversationDetails.date,
                func.count(ConversationDetails.conversation_id).label("conversations"),
                func.sum(ConversationDetails.messages_count).label("messages"),
                func.sum(ConversationDetails.cost_usd).label("cost_usd"),
                func.sum(ConversationDetails.call_duration_hours).label("total_call_duration_hours"),
            )
            .where(ConversationDetails.user_id == user_id)
            .group_by(ConversationDetails.date)
        )

        # Get agent_id first to fetch lead counts
        from app.models.users_db import User
        agent_id_res = await db.execute(select(User.agent_id).where(User.user_id == user_id))
        agent_id = agent_id_res.scalar_one_or_none()
        
        leads_map = {}
        if agent_id:
            lead_date = func.to_char(Lead.created_at, 'DD Mon YYYY')
            leads_res = await db.execute(
                select(
                    lead_date.label("date"),
                    func.count(Lead.lead_id).label("leads")
                )
                .where(Lead.agent_id == agent_id)
                .group_by(lead_date)
            )
            leads_map = {r.date: r.leads for r in leads_res.all()}

        rows = result.all()
        timeseries = []
        for r in rows:
            ts = int((r.total_call_duration_hours or 0) * 3600)
            timeseries.append({
                "date": r.date,
                "conversations": r.conversations,
                "messages": r.messages or 0,
                "cost_usd": r.cost_usd or 0,
                "total_call_duration_secs": ts,
                "avg_call_duration_secs": int(ts / r.conversations) if r.conversations > 0 else 0,
                "leads_captured": leads_map.get(r.date, 0)
            })

        timeseries.sort(key=lambda x: datetime.strptime(x["date"], "%d %b %Y") if x["date"] else datetime.min)
        return {"summary": await get_kpis(user_id, db), "timeseries": timeseries}
    except SQLAlchemyError:
        logger.error("Database error fetching KPI timeseries")
        raise
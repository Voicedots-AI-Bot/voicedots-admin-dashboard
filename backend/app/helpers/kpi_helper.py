from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime, timezone, timedelta
from app.models.usage_db import Usage
from app.models.conversation_details_db import ConversationDetails
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
    call_duration_secs: int = 0,
    start_time_unix_secs: int | None = None,
):
    try:
        # Check if conversation already exists
        result = await db.execute(
            select(ConversationDetails).where(
                ConversationDetails.conversation_id == conversation_id
            )
        )
        existing = result.scalar_one_or_none()

        if existing:
            return

        credits_used = llm_charge + call_charge
        cost_usd = (credits_used / 1000) * PRICE_PER_1000_CREDITS
        cost_usd=Decimal(str(cost_usd))
        
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
            call_duration_secs=call_duration_secs,
            messages_count=messages_count,
        )

        db.add(conversation)

        # Fetch usage
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
                total_cost_usd=0,
                total_call_duration_secs=0,
            )
            db.add(usage)

        usage.total_conversations += 1
        usage.total_messages += messages_count
        usage.total_credits += credits_used
        usage.total_cost_usd += cost_usd
        usage.total_call_duration_secs += call_duration_secs

        await db.commit()

    except SQLAlchemyError as e:
        await db.rollback()
        logger.error(f"Database error while adding conversation KPI: {e}")
        raise


async def get_kpis(user_id: UUID, db: AsyncSession):
    try:
        result = await db.execute(
            select(Usage).where(Usage.user_id == user_id)
        )
        usage = result.scalar_one_or_none()

        if not usage:
            return {
                "total_conversations": 0,
                "total_messages": 0,
                "total_cost_usd": 0,
                "avg_cost_per_conversation_usd": 0,
                "total_call_duration_secs": 0,
                "avg_call_duration_secs": 0,
            }

        total_conversations = usage.total_conversations or 0
        total_messages = usage.total_messages or 0
        total_cost_usd = usage.total_cost_usd or 0
        total_call_duration_secs = usage.total_call_duration_secs or 0

        avg_cost = (
            total_cost_usd / total_conversations
            if total_conversations > 0 else 0
        )

        avg_call_duration = (
            total_call_duration_secs / total_conversations
            if total_conversations > 0 else 0
        )

        return {
            "total_conversations": total_conversations,
            "total_messages": total_messages,
            "total_cost_usd": total_cost_usd,
            "avg_cost_per_conversation_usd": round(avg_cost, 2),
            "total_call_duration_secs": total_call_duration_secs,
            "avg_call_duration_secs": int(avg_call_duration),
        }

    except SQLAlchemyError:
        logger.error("Database error while fetching KPI summary")
        raise


async def get_kpis_with_timeseries(user_id: UUID, db: AsyncSession):
    try:
        result = await db.execute(
            select(
                ConversationDetails.date,
                func.count(ConversationDetails.conversation_id).label("conversations"),
                func.sum(ConversationDetails.messages_count).label("messages"),
                func.sum(ConversationDetails.cost_usd).label("cost_usd"),
                func.sum(ConversationDetails.call_duration_secs).label("total_call_duration_secs"),
            )
            .where(ConversationDetails.user_id == user_id)
            .group_by(ConversationDetails.date)
            .order_by(ConversationDetails.date)
        )

        rows = result.all()

        timeseries = []

        for row in rows:
            avg_call_duration = (
                row.total_call_duration_secs / row.conversations
                if row.conversations and row.conversations > 0 else 0
            )

            timeseries.append({
                "date": row.date,
                "conversations": row.conversations,
                "messages": row.messages or 0,
                "cost_usd": row.cost_usd or 0,
                "avg_call_duration_secs": int(avg_call_duration),
            })

        summary = await get_kpis(user_id, db)

        return {
            "summary": summary,
            "timeseries": timeseries,
        }

    except SQLAlchemyError:
        logger.error("Database error while fetching KPI timeseries")
        raise
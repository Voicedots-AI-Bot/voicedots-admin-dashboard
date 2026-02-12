import asyncio
from app.config.logger import get_logger
from app.helpers.kpi_helper import add_conversation_kpi
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.conversation_details import ConversationDetails
from app.models.users_db import User
from sqlalchemy import select

logger = get_logger("KPI-Aggregator")

async def get_user_id_by_agent_id(db: AsyncSession, agent_id: str):
    try:
        result = await db.execute(
            select(User.user_id).where(User.agent_id == agent_id)
        )
        user_id = result.scalar_one_or_none()
        return user_id
    except Exception as e:
        logger.exception(f"Failed fetching user_id for agent_id {agent_id}: {e}")
        raise

async def aggregate_conversations(
    client,
    agent_id: str,
    db: AsyncSession
):
    """
    One-time KPI aggregation.
    SAFE, idempotent, finishes correctly.
    """

    logger.info(f"KPI aggregation started for agent: {agent_id}")

    try:
        # Fetch already processed conversations
        try:
            result = await db.execute(
                select(ConversationDetails.conversation_id)
            )
            processed_conversations = set(result.scalars().all())
        except Exception as e:
            logger.exception(f"Failed fetching processed conversations: {e}")
            return  # stop safely

        cursor = None
        page = 0
        MAX_PAGES = 50
        user_id = await get_user_id_by_agent_id(db, agent_id)  # Implement this helper to fetch user_id from agent_id
        while True:
            page += 1
            logger.info(f"KPI aggregation page {page} for agent {agent_id}")

            # ---- Page Fetch Protection ----
            try:
                data = await client.list_conversations(agent_id, cursor)
            except Exception as e:
                logger.exception(
                    f"Failed fetching conversations page {page} for agent {agent_id}: {e}"
                )
                break

            if not data:
                logger.info("No data returned, stopping")
                break

            for conv in data.conversations:
                conv_id = conv.conversation_id

                # already aggregated
                if conv_id in processed_conversations:
                    continue

                # only successful calls
                if getattr(conv, "call_successful", None) != "success":
                    continue

                # ---- Conversation Level Protection ----
                try:
                    details = await client.get_conversation_details(conv_id)

                    # meta = details.get("metadata", {})
                    meta = getattr(details, "metadata", {}) or {}
                    messages_count = len(getattr(details, "transcript", []) or [])

                    await add_conversation_kpi(
                        db=db,
                        user_id=user_id,
                        conversation_id=conv_id,
                        # llm_charge=meta.get("llm_charge", 0),
                        llm_charge=getattr(meta, "llm_charge", 0) or 0,
                        # call_charge=meta.get("call_charge", 0),
                        call_charge=getattr(meta, "call_charge", 0) or 0,
                        messages_count=messages_count,
                        # call_duration_secs=meta.get("call_duration_secs", 0),
                        call_duration_secs=getattr(meta, "call_duration_secs", 0) or 0,
                        start_time_unix_secs=(
                            # meta.get("start_time_unix_secs")
                            # or meta.get("accepted_time_unix_secs")
                            # or meta.get("created_at_unix_secs")
                            getattr(meta, "start_time_unix_secs", None)
                            or getattr(meta, "accepted_time_unix_secs", None)
                            or getattr(meta, "created_at_unix_secs", None)
                        ),
                    )

                    await db.commit()

                except Exception as e:
                    logger.exception(
                        f"Failed processing conversation {conv_id}: {e}"
                    )
                    await db.rollback()
                    continue  # move to next conversation

                await asyncio.sleep(0.05)  # polite API usage

            if not data.has_more:
                logger.info("No more pages")
                break

            if page >= MAX_PAGES:
                logger.warning("Max page limit reached")
                break

            cursor = data.next_cursor

    except Exception as e:
        logger.exception(
            f"Critical error in KPI aggregation for agent {agent_id}: {e}"
        )

    finally:
        logger.info(f"KPI aggregation finished for agent: {agent_id}")
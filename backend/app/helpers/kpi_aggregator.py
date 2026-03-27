import asyncio
from app.config.logger import get_logger
from app.helpers.kpi_helper import add_conversation_kpi
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.conversation_details_db import ConversationDetails
from app.models.conversation_db import Conversation
from app.models.leads_db import Lead
from app.models.users_db import User
from sqlalchemy import select
from datetime import datetime
from app.helpers.conversation_helper import conversation_detail_filter

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
            result_details = await db.execute(select(ConversationDetails.conversation_id))
            processed_conversations = set(result_details.scalars().all())

            result_convs = await db.execute(select(Conversation.conversation_id))
            processed_db_convs = set(result_convs.scalars().all())
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
                if getattr(e, "status_code", None) == 404:
                    logger.warning(f"Agent {agent_id} not found (404). Stopping KPI aggregation.")
                else:
                    logger.exception(
                        f"Failed fetching conversations page {page} for agent {agent_id}: {e}"
                    )
                break

            if not data:
                logger.info("No data returned, stopping")
                break

            for conv in data.conversations:
                conv_id = conv.conversation_id

                # already fully aggregated in both tables
                if conv_id in processed_conversations and conv_id in processed_db_convs:
                    logger.debug(f"Skipping already processed conversation: {conv_id}")
                    continue

                # only successful calls
                if getattr(conv, "call_successful", None) != "success":
                    continue

                # ---- Conversation Level Protection ----
                try:
                    details = await client.get_conversation_details(conv_id)
                    meta = getattr(details, "metadata", {}) or {}
                    messages_count = len(getattr(details, "transcript", []) or [])
                    charging_info = getattr(meta, "charging", None)

                    if conv_id not in processed_conversations:
                        await add_conversation_kpi(
                            db=db,
                            user_id=user_id,
                            conversation_id=conv_id,
                            llm_charge=getattr(charging_info, "llm_charge", 0) if charging_info else 0,
                            call_charge=getattr(charging_info, "call_charge", 0) if charging_info else 0,
                            messages_count=messages_count,
                            call_duration_secs=getattr(meta, "call_duration_secs", 0) or 0,
                            start_time_unix_secs=(
                                getattr(meta, "start_time_unix_secs", None)
                                or getattr(meta, "accepted_time_unix_secs", None)
                                or getattr(meta, "created_at_unix_secs", None)
                            ),
                        )

                    if conv_id not in processed_db_convs:
                        filtered_transcript, lead_data = conversation_detail_filter(details)
                        
                        start_time = (
                            getattr(meta, "start_time_unix_secs", None)
                            or getattr(meta, "accepted_time_unix_secs", None)
                        )
                        created_at_dt = datetime.utcfromtimestamp(start_time) if start_time else datetime.utcnow()

                        new_conv = Conversation(
                            conversation_id=conv_id,
                            agent_id=agent_id,
                            transcription=filtered_transcript,
                            created_at=created_at_dt
                        )
                        db.add(new_conv)

                        if lead_data:
                            def safe_str(val):
                                if val is None: return None
                                if isinstance(val, float) and val.is_integer(): return str(int(val))
                                return str(val)

                            name = safe_str(lead_data.get("name"))
                            email = safe_str(lead_data.get("email"))
                            mobile = safe_str(lead_data.get("mobile"))

                            # Only save lead if it has at least one piece of contact info
                            if name or email or mobile:
                                # Check if lead already exists for this conversation (e.g., from webhook)
                                existing_lead = await db.execute(
                                    select(Lead).where(Lead.conversation_id == conv_id)
                                )
                                if not existing_lead.scalar_one_or_none():
                                    new_lead = Lead(
                                        agent_id=agent_id,
                                        conversation_id=conv_id,
                                        name=name,
                                        email=email,
                                        mobile=mobile,
                                        business_description=safe_str(lead_data.get("business_description")),
                                        status=safe_str(lead_data.get("status"))
                                    )
                                    db.add(new_lead)

                    await db.commit()

                except Exception as e:
                    if getattr(e, "status_code", None) == 404:
                        logger.warning(f"Conversation {conv_id} not found (404). Skipping.")
                    else:
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
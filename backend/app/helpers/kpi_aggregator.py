import asyncio
from app.config.logger import get_logger
from app.helpers.conversation_helper import conversation_detail_filter

logger = get_logger("KPI-Aggregator")


async def aggregate_conversations(client, agent_id: str):
    """
    One-time KPI aggregation.
    SAFE, idempotent, finishes correctly.
    """
    logger.info("KPI aggregation started")

    from app.helpers.kpi_helper import _load, add_conversation_kpi

    kpi_data = _load()

    # ✅ SOURCE OF TRUTH = stored conversations
    processed = {
        c["conversation_id"]
        for c in kpi_data.get("conversations", [])
    }

    cursor = None
    page = 0
    MAX_PAGES = 50  # safety guard

    while True:
        page += 1
        logger.info(f"KPI aggregation page {page}")

        data = await client.list_conversations(agent_id, cursor)
        if not data:
            logger.info("No data returned, stopping")
            break

        for conv in data.conversations:
            conv_id = conv.conversation_id

            # already aggregated
            if conv_id in processed:
                continue

            # only successful calls
            if getattr(conv, "call_successful", None) != "success":
                continue

            details = await client.get_conversation_details(conv_id)
            filtered, _ = conversation_detail_filter(details)

            meta = filtered.get("metadata", {})
            messages = filtered.get("messages", [])

            add_conversation_kpi(
                conversation_id=conv_id,
                llm_charge=meta.get("llm_charge", 0),
                call_charge=meta.get("call_charge", 0),
                call_duration_secs=meta.get("call_duration_secs", 0),
                start_time_unix_secs=(
                    meta.get("start_time_unix_secs")
                    or meta.get("accepted_time_unix_secs")
                    or meta.get("created_at_unix_secs")
                ),
                messages_count=len(messages),
            )

            processed.add(conv_id)
            await asyncio.sleep(0.05)  # polite API usage

        if not data.has_more:
            logger.info("No more pages")
            break

        if page >= MAX_PAGES:
            logger.warning("Max page limit reached")
            break

        cursor = data.next_cursor

    logger.info("KPI aggregation finished")

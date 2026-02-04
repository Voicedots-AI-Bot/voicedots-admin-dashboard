import asyncio
from app.config.logger import get_logger
from app.helpers.kpi_helper import add_conversation_kpi, _load
from app.helpers.conversation_helper import conversation_detail_filter

logger = get_logger("KPI-Aggregator")


async def aggregate_conversations(client, agent_id: str):
    """
    Automatically aggregate KPIs for new completed conversations
    """
    logger.info("KPI aggregation started")

    kpi_data = _load()
    processed = set(kpi_data.get("processed_conversations", []))

    cursor = None

    while True:
        data = await client.list_conversations(agent_id, cursor)

        if not data:
            break

        for conv in data.conversations:
            conv_id = conv.conversation_id

            # Skip already processed conversations
            if conv_id in processed:
                continue

            # Only successful / completed calls
            if conv.call_successful != "success":
                continue

            details = await client.get_conversation_details(conv_id)

            filtered, _ = conversation_detail_filter(details)
            meta = filtered.get("metadata", {})
            messages = filtered.get("messages", [])

            add_conversation_kpi(
                conversation_id=conv_id,
                llm_charge=meta.get("llm_charge", 0),
                call_charge=meta.get("call_charge", 0),
                messages_count=len(messages),
            )

            processed.add(conv_id)

        if not data.has_more:
            break

        cursor = data.next_cursor

    logger.info("KPI aggregation finished")

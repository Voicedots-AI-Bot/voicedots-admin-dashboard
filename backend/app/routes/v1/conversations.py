from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional

from app.routes.dependencies import get_elevenlabs_client
from app.config.elevenlabs import ElevenLabsClient
from app.config.logger import get_logger

from app.helpers.kpi_helper import get_kpis, add_conversation_kpi
from app.helpers.conversation_helper import (
    conversations_filter,
    conversation_detail_filter,
)

logger = get_logger("ConversationRouter")

router = APIRouter(
    prefix="/v1/conversations",
    tags=["Conversations"]
)

# --------------------------------------------------
# KPI SUMMARY 
# --------------------------------------------------
@router.get(
    "/kpis/summary",
    summary="Get KPI summary",
    description="Return aggregated KPI metrics for dashboard"
)
def get_kpi_summary():
    return get_kpis()

# --------------------------------------------------
# LIST CONVERSATIONS
# --------------------------------------------------
@router.get(
    "/",
    summary="List conversations",
    description="Retrieve conversations for an agent"
)
async def list_conversations(
    agent_id: Optional[str] = Query(default=None),
    cursor: Optional[str] = Query(default=None),
    client: ElevenLabsClient = Depends(get_elevenlabs_client),
):
    try:
        data = await client.list_conversations(
            agent_id if agent_id else "agent_6301kdfgwyv4fc1r9vvvar5y2fbw",
            cursor
        )

        logger.info("Successfully fetched conversations")

        if not data:
            raise HTTPException(status_code=404, detail="No conversations found")

        filtered_data, next_page = conversations_filter(data)

        return {
            "status": "success",
            "data": filtered_data,
            "next_page": next_page
        }

    except Exception as e:
        logger.exception("Failed to fetch conversations")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch conversations: {str(e)}",
        )

# --------------------------------------------------
# CONVERSATION DETAILS 
# --------------------------------------------------
@router.get(
    "/{conversation_id}",
    summary="Get conversation details",
    description="Retrieve full conversation transcript and metadata"
)
async def get_conversation_details(
    conversation_id: str,
    client: ElevenLabsClient = Depends(get_elevenlabs_client),
):
    try:
        data = await client.get_conversation_details(conversation_id)
        logger.info("Successfully fetched conversation details")

        if not data:
            raise HTTPException(
                status_code=404,
                detail="No conversation details found",
            )

        filtered_data, lead = conversation_detail_filter(data)

        metadata = filtered_data.get("metadata", {})
        messages = filtered_data.get("messages", [])

        add_conversation_kpi(
            conversation_id=conversation_id,
            llm_charge=metadata.get("llm_charge", 0),
            call_charge=metadata.get("call_charge", 0),
            messages_count=len(messages)
        )

        return {
            "status": "success",
            "data": messages,
            "lead": lead
        }

    except Exception as e:
        logger.exception("Failed to fetch conversation details")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch conversation {conversation_id}: {str(e)}",
        )

# --------------------------------------------------
# CONVERSATION AUDIO
# --------------------------------------------------
@router.get(
    "/audio/{conversation_id}",
    summary="Get conversation audio",
    description="Retrieve full conversation audio file"
)
async def get_conversation_audio(
    conversation_id: str,
    client: ElevenLabsClient = Depends(get_elevenlabs_client),
):
    try:
        data = await client.get_conversation_audio(conversation_id)
        logger.info("Successfully fetched conversation audio")

        if not data:
            raise HTTPException(
                status_code=404,
                detail="No conversation audio found",
            )

        return data

    except Exception as e:
        logger.exception("Failed to fetch conversation audio")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch conversation {conversation_id}: {str(e)}",
        )

from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
import asyncio

from app.routes.dependencies import get_elevenlabs_client
from app.config.elevenlabs import ElevenLabsClient
from app.config.logger import get_logger

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
# KPI SUMMARY + TIMESERIES (FOR GRAPHS)
# --------------------------------------------------
@router.get(
    "/kpis",
    summary="Get KPI summary + timeseries",
    description="Return KPI summary and daily timeseries for graphs"
)
def get_kpis_full():
    try:
        from app.helpers.kpi_helper import get_kpis_with_timeseries
        return get_kpis_with_timeseries()

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
    "/kpis/summary",
    summary="Get KPI summary",
    description="Return aggregated KPI metrics for dashboard"
)
def get_kpi_summary():
    try:
        from app.helpers.kpi_helper import get_kpis
        return get_kpis()

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


# --------------------------------------------------
# LIST CONVERSATIONS (TIMEOUT SAFE)
# --------------------------------------------------
@router.get("/")
async def list_conversations(
    agent_id: Optional[str] = Query(default=None),
    cursor: Optional[str] = Query(default=None),
    client: ElevenLabsClient = Depends(get_elevenlabs_client),
):
    try:
        data = await asyncio.wait_for(
            client.list_conversations(
                agent_id or "agent_6301kdfgwyv4fc1r9vvvar5y2fbw",
                cursor
            ),
            timeout=10,
        )

        if not data:
            raise HTTPException(status_code=404, detail="No conversations found")

        filtered_data, next_page = conversations_filter(data)

        return {
            "status": "success",
            "data": filtered_data,
            "next_page": next_page
        }

    except asyncio.TimeoutError:
        logger.error("Timeout fetching conversations")
        raise HTTPException(status_code=504, detail="Conversation service timeout")

    except Exception as e:
        logger.exception("Failed to fetch conversations")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch conversations: {str(e)}",
        )


# --------------------------------------------------
# CONVERSATION DETAILS (READ-ONLY)
# --------------------------------------------------
@router.get("/{conversation_id}")
async def get_conversation_details(
    conversation_id: str,
    client: ElevenLabsClient = Depends(get_elevenlabs_client),
):
    try:
        data = await asyncio.wait_for(
            client.get_conversation_details(conversation_id),
            timeout=10,
        )

        if not data:
            raise HTTPException(
                status_code=404,
                detail="No conversation details found",
            )

        filtered_data, lead = conversation_detail_filter(data)

        return {
            "status": "success",
            "data": filtered_data,
            "lead": lead
        }

    except asyncio.TimeoutError:
        logger.error(f"Timeout fetching conversation {conversation_id}")
        raise HTTPException(status_code=504, detail="Conversation service timeout")

    except Exception as e:
        logger.exception("Failed to fetch conversation details")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch conversation {conversation_id}: {str(e)}",
        )


# --------------------------------------------------
# CONVERSATION AUDIO (TIMEOUT SAFE)
# --------------------------------------------------
@router.get("/audio/{conversation_id}")
async def get_conversation_audio(
    conversation_id: str,
    client: ElevenLabsClient = Depends(get_elevenlabs_client),
):
    try:
        return await asyncio.wait_for(
            client.get_conversation_audio(conversation_id),
            timeout=10,
        )

    except asyncio.TimeoutError:
        logger.error(f"Timeout fetching audio {conversation_id}")
        raise HTTPException(status_code=504, detail="Audio service timeout")

    except Exception as e:
        logger.exception("Failed to fetch conversation audio")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch conversation {conversation_id}: {str(e)}",
        )

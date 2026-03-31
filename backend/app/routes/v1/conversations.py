from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.config.database import get_db
from app.models.users_db import User
from typing import Optional
import asyncio
import uuid
from sqlalchemy import select
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
# LIST CONVERSATIONS (TIMEOUT SAFE)
# --------------------------------------------------
@router.get("/")
async def list_conversations(
    request: Request,
    db: AsyncSession = Depends(get_db),
    cursor: Optional[str] = Query(default=None),
    client: ElevenLabsClient = Depends(get_elevenlabs_client),
):
    try:
        user = request.state.user
        user_id = uuid.UUID(user["sub"])
        
        result = await db.execute(
            select(User.agent_id).where(User.user_id == user_id)
        )
        agent_id = result.scalar_one_or_none()
        
        data = await client.list_conversations(agent_id, cursor)

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
        status_code = getattr(e, "status_code", 500)
        raise HTTPException(
            status_code=status_code,
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
        data = await client.get_conversation_details(conversation_id)

        if not data:
            raise HTTPException(
                status_code=404,
                detail="No conversation details found",
            )

        filtered_data, lead = conversation_detail_filter(data)

        return {
            "status": "success",
            "data": filtered_data,
            "lead": lead,
            "start_time": data.metadata.start_time_unix_secs,
            "end_time": data.metadata.start_time_unix_secs + data.metadata.call_duration_secs,
            "duration": data.metadata.call_duration_secs,
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
        # return await asyncio.wait_for(
        #     client.get_conversation_audio(conversation_id),
        #     timeout=10,
        # )
        return await client.get_conversation_audio(conversation_id)
    
    except asyncio.TimeoutError:
        logger.error(f"Timeout fetching audio {conversation_id}")
        raise HTTPException(status_code=504, detail="Audio service timeout")

    except Exception as e:
        logger.exception("Failed to fetch conversation audio")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch conversation {conversation_id}: {str(e)}",
        )

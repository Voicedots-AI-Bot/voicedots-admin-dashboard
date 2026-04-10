from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.config.database import get_db
from app.models.users_db import User
from typing import Optional
import asyncio
import uuid
from datetime import datetime
from sqlalchemy import select
from app.routes.dependencies import get_elevenlabs_client
from app.config.elevenlabs import ElevenLabsClient
from app.config.logger import get_logger
from app.models.usage_db import Usage
from sqlalchemy import func

from app.helpers.conversation_helper import (
    conversations_filter,
    conversation_detail_filter,
)
from app.models.conversation_details_db import ConversationDetails

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
    start_date: Optional[str] = Query(default=None),
    end_date: Optional[str] = Query(default=None),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=30, ge=1, le=1000),
    client: ElevenLabsClient = Depends(get_elevenlabs_client),
):
    try:
        user = request.state.user
        user_id = uuid.UUID(user["sub"])
        
        result = await db.execute(
            select(User.agent_id).where(User.user_id == user_id)
        )
        agent_id = result.scalar_one_or_none()
        
        # Convert date strings to unix timestamps
        start_ts = None
        end_ts = None
        
        try:
            if start_date:
                # Assuming YYYY-MM-DD from frontend
                dt = datetime.fromisoformat(start_date[:10])
                start_ts = int(dt.timestamp())
            
            if end_date:
                # Set to end of day to include all conversations on that day
                dt = datetime.fromisoformat(end_date[:10]).replace(hour=23, minute=59, second=59)
                end_ts = int(dt.timestamp())
        except ValueError:
            logger.warning(f"Invalid date format: {start_date} or {end_date}")

        data = await client.list_conversations(
            agent_id=agent_id, 
            cursor=cursor,
            start_date=start_ts,
            end_date=end_ts
        )

        if not data:
            raise HTTPException(status_code=404, detail="No conversations found")

        filtered_data, next_page_cursor = conversations_filter(data)

        # Pagination metadata (matching leads.py)
        # Use Usage table to match the KPI summary values if not filtered
        if not start_date and not end_date:
            usage_result = await db.execute(select(Usage.total_conversations).where(Usage.user_id == user_id))
            total_count = usage_result.scalar_one_or_none()
        else:
            # Filtered total count from ConversationDetails
            query = select(func.count(ConversationDetails.conversation_id)).where(ConversationDetails.user_id == user_id)
            if start_date:
                sd = datetime.fromisoformat(start_date[:10]).date()
                query = query.where(func.to_date(ConversationDetails.date, 'DD Mon YYYY') >= sd)
            if end_date:
                ed = datetime.fromisoformat(end_date[:10]).date()
                query = query.where(func.to_date(ConversationDetails.date, 'DD Mon YYYY') <= ed)
            
            total_count = (await db.execute(query)).scalar() or 0
        
        if total_count is None:
            # Fallback to counting rows if usage record not found
            total_count = (await db.execute(
                select(func.count(ConversationDetails.conversation_id)).where(ConversationDetails.user_id == user_id)
            )).scalar() or 0
        
        pages_count = (total_count + limit - 1) // limit if total_count > 0 else 0
        
        logger.info(f"Conversations list: total={total_count}, page={page}, pages={pages_count}")

        return {
            "status": "success",
            "data": filtered_data,
            "next_page": next_page_cursor,
            "pagination": {
                "total": total_count,
                "total_count": total_count,
                "qualified": 0,
                "page": page,
                "current_page": page,
                "limit": limit,
                "pages": pages_count,
                "total_pages": pages_count
            }
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

from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
from app.routes.dependencies import get_elevenlabs_client
from app.config.elevenlabs import ElevenLabsClient
from app.schemas.conversation_schema import ConversationListResponse, ConversationDetailResponse
from app.config.logger import get_logger
from app.helpers.conversation_helper import conversations_filter, conversation_detail_filter
import json

logger = get_logger("ConversationRouter")
router = APIRouter(prefix="/v1/conversations", tags=["Conversations"])

@router.get("/",
    # response_model=ConversationListResponse,
    summary="List conversations",
    description="Retrieve conversations for an agent"
)
async def list_conversations(
    agent_id: Optional[str] = Query(default=None),
    client: ElevenLabsClient = Depends(get_elevenlabs_client),
):
    try:
        data = await client.list_conversations(
            agent_id if agent_id else "agent_6301kdfgwyv4fc1r9vvvar5y2fbw"
        )
        logger.info(f"Successfully fetches the conversations")
        if data:
            filtered_data = conversations_filter(data)
            logger.info(f"Filtered conversations data successfully")
            return {
                "status": "success",
                "data": filtered_data
            }
        else:
            raise HTTPException(
                status_code=404,
                detail="No conversations found",
            )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch conversations: {str(e)}",
        )
        
@router.get("/{conversation_id}",
    # response_model=ConversationDetailResponse,
    summary="Get conversation details",
    description="Retrieve full conversation transcript and metadata"
)
async def get_conversation_details(
    conversation_id: str,
    client: ElevenLabsClient = Depends(get_elevenlabs_client),
):
    try:
        data = await client.get_conversation_details(conversation_id)
        logger.info(f"Successfully fetced conversation details")
        if data:
            filtered_data = conversation_detail_filter(data)
            logger.info(f"Filtered conversations details successfully")
            return {
                "status": "success",
                "data": filtered_data
            }
        else:
            raise HTTPException(
                status_code=404,
                detail="No conversation details found",
            )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch conversation {conversation_id}: {str(e)}",
        )
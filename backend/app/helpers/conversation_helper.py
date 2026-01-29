from app.config.logger import get_logger
from app.config.constants import REQUIRED_LEAD_DATA_PARAMETERS
import json

logger = get_logger("Conversation Filter")

def get_avatar(tool_calls_list: list):
    try:
        if tool_calls_list:
            for tool in tool_calls_list:
                if tool.tool_name == "glowAvatar":
                    params_json = tool.params_as_json
                    logger.info(f"Avatar info: {params_json}")
                    if not params_json:
                        return None
                    params = json.loads(params_json)
                    return params.get("name")

        return None
    except Exception as e:
        logger.error(f"Error in extracting tool calls avatar: {e}")
        return None

def get_lead_data(analysis_data: dict):
    try:
        if not analysis_data:
            return None
        logger.info(f"Analysis data received for lead extraction: {analysis_data}")
        lead_info = analysis_data.data_collection_results_list
        if not lead_info:
            return None
        logger.info(f"Lead info extracted: {lead_info}")
        lead_collected = dict()
        for data in lead_info:
            field = data.data_collection_id
            if field in REQUIRED_LEAD_DATA_PARAMETERS:
                lead_info = data.value
                if lead_info:
                    lead_collected[field] = lead_info
                else:
                    lead_collected[field] = None
        return lead_collected
    except Exception as e:
        logger.error(f"Error in extracting lead data: {e}")
        return None

def conversations_filter(conversations_list: dict):
    try:
        filtered_conversations = []

        for conv in conversations_list.conversations:
            filtered_conversations.append({
                "conversation_id": conv.conversation_id,
                "title": conv.call_summary_title,
                "duration": conv.call_duration_secs,
                "message_count": conv.message_count,
                "call_status": conv.call_successful,
            })

        filtered_conversations.append({
            "next_page": conversations_list.next_cursor
            if conversations_list.has_more
            else None
        })

        return filtered_conversations

    except Exception as e:
        logger.error(f"Error in filtering conversations: {e}")
        raise
    
def conversation_detail_filter(conversation_detail: dict):
    try:
        filtered_conversation_details = []
        
        for msg in conversation_detail.transcript:
            filtered_conversation_details.append({
                "role": msg.role,
                "message": msg.message,
                "avatar": get_avatar(msg.tool_calls),
                "timestamp": msg.time_in_call_secs,
                "interrupted": msg.interrupted,
            })
            
        lead_data = get_lead_data(conversation_detail.analysis)
        filtered_conversation_details.append({
            "lead": lead_data
        })
        
        return filtered_conversation_details
    except Exception as e:
        logger.error(f"Error in filtering conversation details: {e}")
        raise
from app.config.logger import get_logger
from app.config.constants import REQUIRED_LEAD_DATA_PARAMETERS
import json

logger = get_logger("Conversation Filter")

def get_avatar(tool_calls_list: list):
    try:
        if tool_calls_list:
            logger.info("Reading Avatar from list")
            for tool in tool_calls_list:
                if tool.tool_name == "glowAvatar":
                    params_json = tool.params_as_json
                    logger.info(f"Avatar info: {params_json}")
                    if not params_json:
                        return None
                    params = json.loads(params_json)
                    return params.get("name")

        return "SRK"
    except Exception as e:
        logger.error(f"Error in extracting tool calls avatar: {e}")
        return None

def get_lead_data(analysis_data: dict):
    try:
        if not analysis_data:
            return None
        lead_info = analysis_data.data_collection_results_list
        if not lead_info:
            return None
        
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
                "timestamp": int(conv.start_time_unix_secs)*1000,
            })

        if conversations_list.has_more:
            return filtered_conversations, conversations_list.next_cursor
        else:
            return filtered_conversations, None

    except Exception as e:
        logger.error(f"Error in filtering conversations: {e}")
        raise
    
def conversation_detail_filter(conversation_detail: dict):
    try:
        filtered_conversation_details = []

        # -------------------------
        # Transcript
        # -------------------------
        for msg in conversation_detail.transcript:
            filtered_conversation_details.append({
                "role": msg.role,
                "message": msg.message,
                "avatar": get_avatar(msg.tool_calls),
                "timestamp": msg.time_in_call_secs,
                "interrupted": msg.interrupted,
            })

        # -------------------------
        # Lead data 
        # -------------------------
        lead_data = get_lead_data(conversation_detail.analysis)

        # -------------------------
        # METADATA EXTRACTION 
        # -------------------------
        metadata = getattr(conversation_detail, "metadata", None)
        charging = getattr(metadata, "charging", None) if metadata else None

        charges = {
            "llm_charge": getattr(charging, "llm_charge", 0) if charging else 0,
            "call_charge": getattr(charging, "call_charge", 0) if charging else 0,
            "total_credits": (
                getattr(charging, "llm_charge", 0) +
                getattr(charging, "call_charge", 0)
            ) if charging else 0,
            "call_duration_secs": getattr(metadata, "call_duration_secs", 0) if metadata else 0,
            "status": getattr(conversation_detail, "status", None),
        }

        # -------------------------
        # Final return
        # -------------------------
        return {
            "messages": filtered_conversation_details,
            "metadata": charges
        }, lead_data

    except Exception as e:
        logger.error(f"Error in filtering conversation details: {e}")
        raise

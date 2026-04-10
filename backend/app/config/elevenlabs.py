from elevenlabs import AsyncElevenLabs
from typing import Dict, Any
from app.config.settings import settings
from fastapi.responses import StreamingResponse
from app.config.logger import get_logger

logger = get_logger("ElevenLabsClient")

class ElevenLabsClient:
    def __init__(self, api_key: str):
        self.client = AsyncElevenLabs(api_key=api_key)
    
    async def list_agents(self) -> Dict[str, Any]:
        return await self.client.conversational_ai.agents.list()
    
    async def list_conversations(
        self, 
        agent_id: str = None, 
        cursor: str = None,
        start_date: int = None,
        end_date: int = None
    ) -> Dict[str, Any]:
        return await self.client.conversational_ai.conversations.list(
            agent_id=agent_id, 
            cursor=cursor,
            call_start_after_unix=start_date,
            call_start_before_unix=end_date
        )
    
    async def get_conversation_details(self, conversation_id: str):
        return await self.client.conversational_ai.conversations.get(conversation_id)
    
    async def get_conversation_audio(self, conversation_id: str):
        audio_stream = self.client.conversational_ai.conversations.audio.get(conversation_id)
        return StreamingResponse(audio_stream, media_type="audio/mpeg")
    

elevenlabs_client = ElevenLabsClient(settings.ELEVENLABS_API_KEY)
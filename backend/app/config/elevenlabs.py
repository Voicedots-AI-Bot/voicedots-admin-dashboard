from elevenlabs import AsyncElevenLabs
from typing import Dict, Any
from app.config.settings import settings

class ElevenLabsClient:
    def __init__(self, api_key: str):
        self.client = AsyncElevenLabs(api_key=api_key)
    
    async def list_agents(self) -> Dict[str, Any]:
        return await self.client.conversational_ai.agents.list()
    
    async def list_conversations(self, agent_id: str = None, cursor: str = None) -> Dict[str, Any]:
        return await self.client.conversational_ai.conversations.list(agent_id=agent_id, cursor=cursor)
    
    async def get_conversation_details(self, conversation_id: str):
        return await self.client.conversational_ai.conversations.get(conversation_id)

elevenlabs_client = ElevenLabsClient(settings.ELEVENLABS_API_KEY)
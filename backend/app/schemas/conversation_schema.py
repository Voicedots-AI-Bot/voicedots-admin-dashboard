from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class ConversationListResponse(BaseModel):
    status: str
    data: List[Dict[str, Any]]

class ConversationDetailResponse(BaseModel):
    status: str
    data: Dict[str, Any]
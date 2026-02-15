from sqlalchemy import Column, String, Integer, Numeric, ForeignKey
from app.config.database import Base
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID

class ConversationDetails(Base):
    __tablename__ = "conversation_details"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id", ondelete="CASCADE"))
    conversation_id = Column(String, primary_key=True, index=True)
    timestamp = Column(String, index=True)
    date = Column(String, index=True)
    cost_credits = Column(Integer, index=True)
    cost_usd = Column(Numeric(12,6), index=True)
    call_duration_secs = Column(Integer, index=True)
    messages_count = Column(Integer, index=True)
    
    user = relationship("User", back_populates="conversation_details")
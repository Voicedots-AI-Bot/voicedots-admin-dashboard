from sqlalchemy import Column, Integer, ForeignKey
from app.config.database import Base
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID

class Usage(Base):
    __tablename__ = "usage"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id", ondelete="CASCADE"), primary_key=True)
    total_conversations = Column(Integer, index=True)
    total_messages = Column(Integer, index=True)
    total_credits = Column(Integer, index=True)
    total_cost_usd = Column(Integer, index=True)
    total_call_duration_secs = Column(Integer, index=True)
    
    user = relationship("User", back_populates="usage")
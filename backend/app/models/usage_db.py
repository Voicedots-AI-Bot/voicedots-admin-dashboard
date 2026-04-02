from sqlalchemy import Column, Integer, Numeric, ForeignKey
from app.config.database import Base
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID

class Usage(Base):
    __tablename__ = "usage"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id", ondelete="CASCADE"), primary_key=True)
    total_conversations = Column(Integer)
    total_messages = Column(Integer)
    total_credits = Column(Integer)
    total_cost_usd = Column(Numeric(12,6))
    total_call_duration_hours = Column(Numeric(12,6))
    
    user = relationship("User", back_populates="usage")
# app/models/lead.py

from sqlalchemy import Column, String, Text, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.config.database import Base
from datetime import datetime
import uuid


class Lead(Base):
    __tablename__ = "leads"

    lead_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    agent_id = Column(
        String,
        ForeignKey("users.agent_id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    conversation_id = Column(String, index=True)

    name = Column(String)
    email = Column(String, index=True)
    mobile = Column(String)
    business_description = Column(Text)
    status = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="leads")
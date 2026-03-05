from sqlalchemy import Column, String
from app.config.database import Base
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
import uuid

class User(Base):
    __tablename__ = "users"

    user_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, index=True)
    name = Column(String, index=True)
    agent_id = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    profile_picture = Column(String, nullable=True)
    
    usage = relationship(
        "Usage",
        back_populates="user",
        uselist=False,
        cascade="all, delete"
    )
    
    conversation_details = relationship(
        "ConversationDetails",
        back_populates="user",
        cascade="all, delete"
    )
    
    leads = relationship(
        "Lead",
        back_populates="user",
        cascade="all, delete",
    )
    
    ticket = relationship(
        "Ticket", 
        back_populates="user", 
        cascade="all, delete"
    )
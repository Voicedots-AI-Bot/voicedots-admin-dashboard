from sqlalchemy import Column, String, ForeignKey
from app.config.database import Base
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
import uuid

class Ticket(Base):
    __tablename__ = "ticket"

    ticket_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id", ondelete="CASCADE"))
    name = Column(String)
    email = Column(String, index=True)
    mobile = Column(String, index=True)
    category = Column(String)
    sub_category = Column(String)
    description = Column(String)
    status = Column(String)
    
    
    user = relationship("User", back_populates="ticket")
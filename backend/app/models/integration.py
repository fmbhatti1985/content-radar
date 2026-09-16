from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
import uuid

from app.db.base_class import Base

class Integration(Base):
    __tablename__ = "integration"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    # In a real app this connects to the User table, keeping it simple for MVP
    user_id = Column(String, index=True, nullable=True, default="default_user") 
    
    platform = Column(String, index=True, nullable=False) # youtube, instagram, facebook, tiktok
    account_id = Column(String, nullable=True) # ID provided by the social platform
    account_name = Column(String, nullable=True) # Display name like "@mychannel"
    
    access_token = Column(Text, nullable=False)
    refresh_token = Column(Text, nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.db.base_class import Base

class Creator(Base):
    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    username = Column(String, index=True, nullable=False)
    display_name = Column(String, nullable=True)
    platform = Column(String, index=True, nullable=False) # tiktok, youtube, etc.
    avatar_url = Column(String, nullable=True)
    followers = Column(Integer, nullable=True)
    bio = Column(String, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

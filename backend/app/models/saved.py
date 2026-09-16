from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
import uuid

from app.db.base_class import Base

class SavedContent(Base):
    __tablename__ = "savedcontent"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    content_id = Column(String, ForeignKey("contentitem.id"), index=True, nullable=False)
    note = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

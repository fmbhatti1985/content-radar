from app.db.base_class import Base

# Import all models here for Alembic to detect them
from app.models.user import User
from app.models.creator import Creator
from app.models.content import ContentItem
from app.models.scan import Scan
from app.models.match import ContentMatch, ContentGap

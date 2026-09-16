import asyncio
from app.db.session import engine
from app.db.base_class import Base

# Import ALL models so metadata knows about them
from app.models.content import ContentItem
from app.models.creator import Creator
from app.models.match import ContentGap
from app.models.scan import Scan
from app.models.saved import SavedContent
from app.models.integration import Integration

async def go():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Integration table created successfully")

asyncio.run(go())

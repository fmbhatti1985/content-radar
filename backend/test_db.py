import asyncio
from app.db.session import SessionLocal
from app.models.scan import Scan
from sqlalchemy import select

async def check():
    async with SessionLocal() as db:
        res = await db.execute(select(Scan))
        scans = res.scalars().all()
        for s in scans:
            print(f"Scan: {s.id}, Status: {s.status}, Progress: {s.progress}, Error: {s.error_message}")

if __name__ == "__main__":
    asyncio.run(check())

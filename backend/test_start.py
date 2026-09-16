import asyncio
from app.api.v1.endpoints.scans import create_scan, ScanCreate
from app.db.session import SessionLocal
from fastapi import BackgroundTasks

async def test():
    scan_in = ScanCreate(
        creator_identifier="https://www.youtube.com/@mkbhd",
        source_platform="youtube",
        target_platforms=["tiktok", "instagram"],
        content_limit=2
    )
    bg = BackgroundTasks()
    db = SessionLocal()
    try:
        res = await create_scan(scan_in, bg, db)
        print("Create response:", res)
    finally:
        await db.close()

    for task in bg.tasks:
        print("Running task...")
        try:
            await task()
        except Exception as e:
            print("Task error:", e)

if __name__ == "__main__":
    asyncio.run(test())

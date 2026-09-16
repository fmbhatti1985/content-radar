import asyncio
from app.db.session import SessionLocal
from app.models.scan import Scan
from app.models.creator import Creator
from app.services.orchestrator import ScanOrchestrator
import uuid

async def test():
    db = SessionLocal()
    try:
        # Create a mock creator
        creator = Creator(
            id=str(uuid.uuid4()),
            username="https://www.youtube.com/@mkbhd",
            display_name="MKBHD",
            platform="youtube"
        )
        db.add(creator)
        
        # Create a scan
        scan = Scan(
            id=str(uuid.uuid4()),
            creator_id=creator.id,
            source_platform="youtube",
            target_platforms=["tiktok", "instagram"],
            content_limit=2
        )
        db.add(scan)
        await db.commit()
        
        print(f"Created scan {scan.id}")
        
    except Exception as e:
        print("DB Setup Error:", e)
        return
    finally:
        await db.close()

    # Now run orchestrator
    bg_db = SessionLocal()
    try:
        orch = ScanOrchestrator(bg_db)
        await orch.run_scan(scan.id)
        print("Orchestrator finished.")
        
        # Refetch
        final_scan = await bg_db.get(Scan, scan.id)
        print(f"Final status: {final_scan.status}, progress: {final_scan.progress}, error: {final_scan.error_message}")
        
    except Exception as e:
        print("Orchestrator Error:", e)
    finally:
        await bg_db.close()

if __name__ == "__main__":
    asyncio.run(test())

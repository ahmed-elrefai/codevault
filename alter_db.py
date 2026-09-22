import asyncio
import os
from dotenv import load_dotenv
load_dotenv("backend/.env")

from backend.databases.db import db_instance

async def main():
    await db_instance.initialize()
    try:
        await db_instance.execute("ALTER TABLE documents ADD COLUMN IF NOT EXISTS burn_after_read BOOLEAN DEFAULT FALSE")
        await db_instance.execute("ALTER TABLE documents ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0")
        await db_instance.execute("ALTER TABLE documents ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ")
        print("Database altered successfully!")
    except Exception as e:
        print(f"Error altering database: {e}")
    finally:
        await db_instance.close()

if __name__ == "__main__":
    asyncio.run(main())

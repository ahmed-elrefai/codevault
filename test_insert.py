import asyncio
from backend.databases.db import Postgres
import os

async def main():
    db = Postgres(dsn=os.getenv("DATABASE_URL"))
    await db.initialize()
    try:
        await db.execute("INSERT INTO users (clerk_id) VALUES ('test_clerk_id')")
        print("Insert successful!")
    except Exception as e:
        print(f"Insert failed: {type(e).__name__}: {e}")
    await db.close()

asyncio.run(main())

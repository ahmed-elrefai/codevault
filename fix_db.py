import asyncio
from backend.databases.db import Postgres
from backend.databases.schema import create_tables
import os

async def main():
    db = Postgres(dsn=os.getenv("DATABASE_URL"))
    await db.initialize()
    await db.execute("DROP TABLE IF EXISTS analyzer_keys CASCADE;")
    await db.execute("DROP TABLE IF EXISTS documents CASCADE;")
    await db.execute("DROP TABLE IF EXISTS users CASCADE;")
    await db.close()

asyncio.run(main())

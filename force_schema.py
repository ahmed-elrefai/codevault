import asyncio
from backend.databases.db import Postgres
from backend.databases.schema import create_tables
import os

async def main():
    db = Postgres(dsn=os.getenv("DATABASE_URL"))
    await db.initialize()
    await create_tables(db)
    print("Tables created manually.")
    await db.close()

asyncio.run(main())

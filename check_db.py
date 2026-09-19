import asyncio
from backend.databases.db import Postgres
import os

async def main():
    db = Postgres(dsn=os.getenv("DATABASE_URL"))
    await db.initialize()
    res = await db.fetch("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users';")
    print(res)
    await db.close()

asyncio.run(main())

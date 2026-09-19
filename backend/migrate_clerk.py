import asyncio
import asyncpg

async def main():
    conn = await asyncpg.connect('postgresql://postgres:Ahmed2005as%23root@localhost:5432/testdb')
    await conn.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS clerk_id TEXT UNIQUE;")
    print('Migration complete')
    await conn.close()

asyncio.run(main())

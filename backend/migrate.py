import asyncio
import asyncpg

async def main():
    conn = await asyncpg.connect('postgresql://postgres:Ahmed2005as%23root@localhost:5432/testdb')
    await conn.execute("ALTER TABLE documents ADD COLUMN IF NOT EXISTS visibility TEXT CHECK (visibility IN ('public', 'private')) DEFAULT 'public';")
    await conn.execute("UPDATE documents SET visibility = 'public' WHERE visibility IS NULL;")
    print('Migration complete')
    await conn.close()

asyncio.run(main())

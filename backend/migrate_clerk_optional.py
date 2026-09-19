import asyncio
import asyncpg

async def main():
    conn = await asyncpg.connect('postgresql://postgres:Ahmed2005as%23root@localhost:5432/testdb')
    await conn.execute("ALTER TABLE users ALTER COLUMN name DROP NOT NULL;")
    await conn.execute("ALTER TABLE users ALTER COLUMN email DROP NOT NULL;")
    await conn.execute("ALTER TABLE users ALTER COLUMN password DROP NOT NULL;")
    print('Migration complete')
    await conn.close()

asyncio.run(main())

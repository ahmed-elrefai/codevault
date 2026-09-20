import asyncio
import asyncpg

async def main():
    conn = await asyncpg.connect('postgresql://postgres:Ahmed2005as%23root@localhost:5432/testdb')
    cols = await conn.fetch("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users'")
    print(cols)
    await conn.close()

if __name__ == '__main__':
    asyncio.run(main())

import asyncio
import asyncpg

async def main():
    conn = await asyncpg.connect('postgresql://postgres:Ahmed2005as%23root@localhost:5432/testdb')
    users = await conn.fetch('SELECT * FROM users')
    print(users)
    await conn.close()

if __name__ == '__main__':
    asyncio.run(main())

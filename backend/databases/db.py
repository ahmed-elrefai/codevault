import asyncpg


class Postgres:
    def __init__(self, dsn: str):
        self.dsn = dsn
        self.pool = None
        self.init_pool()

    async def init_pool(self):
        self.pool = await asyncpg.create_pool(self.dsn, min_size=1, max_size=5)
    
    async def close(self):
        await self.pool.close()
    
    async def execute(self, query: str):
        async with self.pool.acquire() as connection:
            return await connection.execute(query)
    
    async def fetch(self, query: str):
        async with self.pool.acquire() as connection:
            return await connection.fetch(query)

    def __str__(self):
        return str(len(self.pool))
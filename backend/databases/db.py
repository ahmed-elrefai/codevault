import asyncpg
from abc import ABC, abstractmethod
import os

class AbstractDatabase(ABC):
    def __init__(self, dsn: str):
        self.dsn = dsn
    @abstractmethod
    async def create_table(self, table_name: str, *columns: str):
        pass

    @abstractmethod
    async def initialize(self):
        pass

    @abstractmethod
    async def close(self):
        pass
    
    @abstractmethod
    async def execute(self, query: str):
        pass
    
    @abstractmethod
    async def fetch(self, query: str):
        pass


class Postgres(AbstractDatabase):
    def __init__(self, dsn: str):
        super().__init__(dsn)
        self.pool = None

    async def initialize(self):
        self.pool = await asyncpg.create_pool(self.dsn, min_size=1, max_size=5)
    
    async def close(self):
        await self.pool.close()
    
    async def execute(self, query: str, *args):
        """Executes a query (INSERT, UPDATE, DELETE)."""
        async with self.pool.acquire() as connection:
            return await connection.execute(query, *args)
    
    async def fetch(self, query: str, *args):
        async with self.pool.acquire() as connection:
            records = await connection.fetch(query, *args)
            return [dict(r) for r in records]
    
    async def fetchrow(self, query: str, *args):
        async with self.pool.acquire() as connection:
            record = await connection.fetchrow(query, *args)
            return dict(record)
    
    async def create_table(self, table_name: str, *columns: str):
        query = f"CREATE TABLE IF NOT EXISTS {table_name} ({', '.join(columns)})"
        await self.execute(query)

    def __str__(self):
        return str(len(self.pool))

db_instance = Postgres(dsn=os.getenv("DATABASE_URL"))

async def get_db():
    yield db_instance
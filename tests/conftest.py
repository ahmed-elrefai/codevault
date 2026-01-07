
import pytest
import pytest_asyncio
from httpx import AsyncClient
import sys
import os

# Create a clean import environment by adding ROOT to path
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from backend.databases import db as db_module
import backend.app as app_module
from backend.utils.security import hash_password as real_hash_password

# Mock Database Class
class MockDatabase(db_module.AbstractDatabase):
    def __init__(self):
        super().__init__("mock_dsn")
        self.users = []
        self.documents = []
        self._user_id_counter = 1
        self._doc_id_counter = 1

    async def initialize(self): pass
    async def close(self): pass
    async def create_table(self, *args): pass

    async def execute(self, query: str, *args):
        # MOCK IMPLEMENTATION FOR TESTING
        if "INSERT INTO users" in query:
            # args: name, email, password
            self.users.append({
                "id": self._user_id_counter,
                "name": args[0],
                "email": args[1],
                "password": args[2]
            })
            self._user_id_counter += 1
            return
        if "DELETE FROM users" in query:
             self.users = [u for u in self.users if u["id"] != args[0]]
             return

    async def fetchrow(self, query: str, *args):
        # Helper class to allow attribute access like record.id AND dict access like dict(record)
        class Record(dict):
            def __getattr__(self, name):
                if name in self:
                    return self[name]
                raise AttributeError(f"'Record' object has no attribute '{name}'")

        if "SELECT name, email, password, id FROM users" in query:
            # Login check
            for user in self.users:
                if user["email"] == args[0]:
                    return Record(user)
            return None
        if "SELECT * FROM users WHERE id =" in query:
             for user in self.users:
                if user["id"] == args[0]:
                    return Record(user)
             return None
        return None

    async def fetch(self, query: str, *args):
        return []

# Singleton mock db
mock_db_instance = MockDatabase()

# PATCH THE REAL DB INSTANCE
db_module.db_instance = mock_db_instance
app_module.db_instance = mock_db_instance

from backend.app import app

async def get_mock_db():
    yield mock_db_instance

# Override dependency
app.dependency_overrides[db_module.get_db] = get_mock_db

from httpx import AsyncClient, ASGITransport

@pytest_asyncio.fixture
async def async_client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client

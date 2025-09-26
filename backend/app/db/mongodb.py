import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
DB_NAME = "ai_teaching_assistant"

client = AsyncIOMotorClient(MONGODB_URI)
db = client[DB_NAME]

async def get_database():
    return db
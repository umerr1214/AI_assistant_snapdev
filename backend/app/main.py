import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from app.api.v1.endpoints import auth, projects
from app.db.mongodb import get_database

load_dotenv()

app = FastAPI()

# CORS configuration
origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(projects.router, prefix="/api/v1/projects", tags=["projects"])

@app.get("/healthz")
async def health_check():
    try:
        db = await get_database()
        await db.command('ping')
        return {"status": "ok", "db_connected": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail={"status": "error", "db_connected": False, "details": str(e)})
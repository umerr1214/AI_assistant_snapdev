from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class Project(BaseModel):
    id: str = Field(..., alias="_id")
    user_id: str
    name: str
    description: Optional[str] = None
    subject: Optional[str] = None
    level: Optional[str] = None
    status: str = "active"
    created_date: datetime = Field(default_factory=datetime.utcnow)
    last_modified_date: datetime = Field(default_factory=datetime.utcnow)

class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    subject: Optional[str] = None
    level: Optional[str] = None

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    subject: Optional[str] = None
    level: Optional[str] = None
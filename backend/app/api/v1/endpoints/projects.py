from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.models.project import Project, ProjectCreate, ProjectUpdate
from app.models.user import User
from app.core.security import get_current_user
from app.db.mongodb import get_database
from bson import ObjectId
from datetime import datetime

router = APIRouter()

@router.post("/", response_model=Project)
async def create_project(
    project: ProjectCreate,
    db=Depends(get_database),
    current_user: User = Depends(get_current_user),
):
    project_data = project.dict()
    project_data["user_id"] = current_user.id
    project_data["created_date"] = datetime.utcnow()
    project_data["last_modified_date"] = datetime.utcnow()
    result = await db.projects.insert_one(project_data)
    created_project = await db.projects.find_one({"_id": result.inserted_id})
    return Project(**created_project)

@router.get("/", response_model=List[Project])
async def list_projects(
    searchTerm: str = None,
    status: str = "all",
    db=Depends(get_database),
    current_user: User = Depends(get_current_user),
):
    query = {"user_id": current_user.id}
    if searchTerm:
        query["name"] = {"$regex": searchTerm, "$options": "i"}
    if status != "all":
        query["status"] = status
    projects = await db.projects.find(query).to_list(100)
    return [Project(**p) for p in projects]

@router.put("/{project_id}", response_model=Project)
async def update_project(
    project_id: str,
    project: ProjectUpdate,
    db=Depends(get_database),
    current_user: User = Depends(get_current_user),
):
    existing_project = await db.projects.find_one(
        {"_id": ObjectId(project_id), "user_id": current_user.id}
    )
    if not existing_project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    update_data = project.dict(exclude_unset=True)
    update_data["last_modified_date"] = datetime.utcnow()
    
    await db.projects.update_one(
        {"_id": ObjectId(project_id)}, {"$set": update_data}
    )
    
    updated_project = await db.projects.find_one({"_id": ObjectId(project_id)})
    return Project(**updated_project)

@router.delete("/{project_id}", status_code=204)
async def delete_project(
    project_id: str,
    db=Depends(get_database),
    current_user: User = Depends(get_current_user),
):
    result = await db.projects.delete_one(
        {"_id": ObjectId(project_id), "user_id": current_user.id}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    return

@router.put("/{project_id}/archive", response_model=Project)
async def archive_project(
    project_id: str,
    db=Depends(get_database),
    current_user: User = Depends(get_current_user),
):
    existing_project = await db.projects.find_one(
        {"_id": ObjectId(project_id), "user_id": current_user.id}
    )
    if not existing_project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    await db.projects.update_one(
        {"_id": ObjectId(project_id)}, {"$set": {"status": "archived", "last_modified_date": datetime.utcnow()}}
    )
    
    updated_project = await db.projects.find_one({"_id": ObjectId(project_id)})
    return Project(**updated_project)

@router.put("/{project_id}/unarchive", response_model=Project)
async def unarchive_project(
    project_id: str,
    db=Depends(get_database),
    current_user: User = Depends(get_current_user),
):
    existing_project = await db.projects.find_one(
        {"_id": ObjectId(project_id), "user_id": current_user.id}
    )
    if not existing_project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    await db.projects.update_one(
        {"_id": ObjectId(project_id)}, {"$set": {"status": "active", "last_modified_date": datetime.utcnow()}}
    )
    
    updated_project = await db.projects.find_one({"_id": ObjectId(project_id)})
    return Project(**updated_project)
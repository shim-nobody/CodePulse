"""
CodePulse Projects Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.schemas.schemas import ProjectCreate, ProjectUpdate, ProjectResponse
from app.services.project_service import ProjectService

router = APIRouter(prefix="/projects", tags=["Projects"])

@router.get("", response_model=List[ProjectResponse])
def get_all_projects(db: Session = Depends(get_db)):
    projs = ProjectService.list_projects(db)
    res = []
    for p in projs:
        res.append(ProjectResponse(
            id=p.id,
            user_id=p.user_id,
            name=p.name,
            description=p.description or "",
            language=p.language or "python",
            created_at=p.created_at,
            updated_at=p.updated_at,
            files_count=len(p.source_files),
            analyses_count=0,
            avg_complexity=1.0
        ))
    return res

@router.post("", response_model=ProjectResponse)
def create_new_project(data: ProjectCreate, db: Session = Depends(get_db)):
    p = ProjectService.create_project(db, data)
    return ProjectResponse(
        id=p.id,
        user_id=p.user_id,
        name=p.name,
        description=p.description or "",
        language=p.language or "python",
        created_at=p.created_at,
        updated_at=p.updated_at,
        files_count=0,
        analyses_count=0,
        avg_complexity=1.0
    )

@router.get("/{project_id}", response_model=ProjectResponse)
def get_project_by_id(project_id: str, db: Session = Depends(get_db)):
    p = ProjectService.get_project(db, project_id)
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")
    return ProjectResponse(
        id=p.id,
        user_id=p.user_id,
        name=p.name,
        description=p.description or "",
        language=p.language or "python",
        created_at=p.created_at,
        updated_at=p.updated_at,
        files_count=len(p.source_files),
        analyses_count=0,
        avg_complexity=1.0
    )

@router.put("/{project_id}", response_model=ProjectResponse)
def update_project(project_id: str, data: ProjectUpdate, db: Session = Depends(get_db)):
    p = ProjectService.update_project(db, project_id, data)
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")
    return ProjectResponse(
        id=p.id,
        user_id=p.user_id,
        name=p.name,
        description=p.description or "",
        language=p.language or "python",
        created_at=p.created_at,
        updated_at=p.updated_at,
        files_count=len(p.source_files),
        analyses_count=0,
        avg_complexity=1.0
    )

@router.delete("/{project_id}")
def delete_project_by_id(project_id: str, db: Session = Depends(get_db)):
    ok = ProjectService.delete_project(db, project_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"message": "Project deleted successfully", "id": project_id}

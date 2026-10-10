"""
CodePulse Project CRUD & Management Service
"""
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models.models import Project, SourceFile
from app.schemas.schemas import ProjectCreate, ProjectUpdate

class ProjectService:
    @staticmethod
    def create_project(db: Session, data: ProjectCreate, user_id: Optional[str] = None) -> Project:
        proj = Project(
            name=data.name,
            description=data.description or "",
            language=data.language or "python",
            user_id=user_id
        )
        db.add(proj)
        db.commit()
        db.refresh(proj)
        return proj

    @staticmethod
    def list_projects(db: Session, user_id: Optional[str] = None) -> List[Project]:
        query = db.query(Project)
        if user_id:
            query = query.filter(Project.user_id == user_id)
        return query.order_by(desc(Project.updated_at)).all()

    @staticmethod
    def get_project(db: Session, project_id: str) -> Optional[Project]:
        return db.query(Project).filter(Project.id == project_id).first()

    @staticmethod
    def update_project(db: Session, project_id: str, data: ProjectUpdate) -> Optional[Project]:
        proj = db.query(Project).filter(Project.id == project_id).first()
        if not proj:
            return None
        if data.name is not None:
            proj.name = data.name
        if data.description is not None:
            proj.description = data.description
        if data.language is not None:
            proj.language = data.language
        db.commit()
        db.refresh(proj)
        return proj

    @staticmethod
    def delete_project(db: Session, project_id: str) -> bool:
        proj = db.query(Project).filter(Project.id == project_id).first()
        if not proj:
            return False
        db.delete(proj)
        db.commit()
        return True

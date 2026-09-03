from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.api.deps import require_role
from app.database import get_db
from app.models.job import JobSkill
from app.models.student import StudentSkill

router = APIRouter(prefix="/skills", tags=["Skills"])
authenticated = require_role(["student", "company", "admin", "super_admin"])


@router.get("/suggestions")
def skill_suggestions(
    q: str = Query("", max_length=100),
    limit: int = Query(12, ge=1, le=50),
    _: object = Depends(authenticated),
    db: Session = Depends(get_db),
):
    term = q.strip().lower()
    name_filter = f"%{term}%"
    rows = db.query(StudentSkill.skill_area, StudentSkill.skill_name).filter(
        or_(StudentSkill.skill_name.ilike(name_filter), StudentSkill.skill_area.ilike(name_filter))
    ).distinct().all() if term else db.query(StudentSkill.skill_area, StudentSkill.skill_name).distinct().all()
    job_rows = db.query(JobSkill.skill_area, JobSkill.skill_name).filter(
        or_(JobSkill.skill_name.ilike(name_filter), JobSkill.skill_area.ilike(name_filter))
    ).distinct().all() if term else db.query(JobSkill.skill_area, JobSkill.skill_name).distinct().all()
    values = {(area or "Other", name) for area, name in [*rows, *job_rows] if name}
    return [{"skill_area": area, "skill_name": name} for area, name in sorted(values, key=lambda item: item[1].lower())[:limit]]
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.api.deps import require_role
from app.models.user import User
from app.models.student import (
    StudentSkill,
    StudentExperience,
    StudentCertification,
    StudentSoftSkill,
    StudentAchievement,
)
from app.services.admin_service import AdminService
from app.schemas.company import CompanyUpdateRequest, CompanyStatusUpdateRequest
from app.schemas.job import JobCreateRequest, JobUpdateRequest, JobStatusUpdateRequest

router = APIRouter(prefix="/admin", tags=["Admin"])
admin_or_super = require_role(["admin", "super_admin"])

# ---------- Company Management ----------
@router.get("/companies")
def list_companies(
    status: Optional[str] = Query(None, regex="^(pending|approved|rejected|disabled)$"),
    page: int = 1,
    page_size: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_or_super)
):
    return AdminService.list_companies(db, status, page, page_size)

@router.get("/companies/{company_id}")
def get_company(
    company_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_or_super)
):
    company = AdminService.get_company_detail(db, company_id)
    # include user email
    return {
        "id": company.id,
        "user_id": company.user_id,
        "email": company.user.email,
        "company_name": company.company_name,
        "website": company.website,
        "industry": company.industry,
        "description": company.description,
        "logo_path": company.logo_path,
        "contact_email": company.contact_email,
        "contact_phone": company.contact_phone,
        "location": company.location,
        "status": company.status,
        "approved_by": company.approved_by,
        "approved_at": company.approved_at,
        "created_at": company.created_at,
        "updated_at": company.updated_at
    }

@router.patch("/companies/{company_id}")
def update_company(
    company_id: int,
    update_data: CompanyUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_or_super)
):
    company = AdminService.update_company(db, company_id, update_data)
    return {"message": "Company updated", "company_id": company.id}

@router.post("/companies/{company_id}/approve")
def approve_company(
    company_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_or_super)
):
    AdminService.approve_company(db, company_id, current_user.id)
    return {"message": "Company approved"}

@router.post("/companies/{company_id}/reject")
def reject_company(
    company_id: int,
    reason: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_or_super)
):
    AdminService.reject_company(db, company_id, reason)
    return {"message": "Company rejected"}

@router.post("/companies/{company_id}/disable")
def disable_company(
    company_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_or_super)
):
    AdminService.disable_company(db, company_id)
    return {"message": "Company disabled"}

@router.patch("/companies/{company_id}/status")
def update_company_status(
    company_id: int,
    status_data: CompanyStatusUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_or_super)
):
    AdminService.update_company_status(db, company_id, status_data)
    return {"message": "Company status updated"}

# ---------- Job Management ----------
@router.post("/jobs")
def create_job(
    job_data: JobCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_or_super)
):
    job = AdminService.create_job(db, job_data, current_user.id)
    return {"message": "Job created", "job_id": job.id}

@router.patch("/jobs/{job_id}")
def update_job(
    job_id: int,
    update_data: JobUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_or_super)
):
    job = AdminService.update_job(db, job_id, update_data)
    return {"message": "Job updated", "job_id": job.id}

@router.patch("/jobs/{job_id}/status")
def update_job_status(
    job_id: int,
    status_data: JobStatusUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_or_super)
):
    job = AdminService.update_job_status(db, job_id, status_data)
    return {"message": "Job status updated", "job_id": job.id}

@router.get("/jobs")
def list_jobs(
    status: Optional[str] = None,
    company_id: Optional[int] = None,
    page: int = 1,
    page_size: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_or_super)
):
    filters = {}
    if status:
        filters["status"] = status
    if company_id:
        filters["company_id"] = company_id
    return AdminService.list_jobs(db, filters, page, page_size)

# ---------- Student Management ----------
@router.get("/students")
def list_students(
    department: Optional[str] = None,
    semester: Optional[str] = None,
    skills: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_or_super)
):
    return AdminService.list_students(db, department, semester, skills, page, page_size)

@router.get("/students/{student_id}")
def get_student_detail(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_or_super)
):
    student = AdminService.get_student_detail(db, student_id)
    # Build full details with related data
    skills = db.query(StudentSkill).filter(StudentSkill.student_profile_id == student_id).all()
    experiences = db.query(StudentExperience).filter(StudentExperience.student_profile_id == student_id).all()
    certifications = db.query(StudentCertification).filter(StudentCertification.student_profile_id == student_id).all()
    soft_skills = db.query(StudentSoftSkill).filter(StudentSoftSkill.student_profile_id == student_id).all()
    achievements = db.query(StudentAchievement).filter(StudentAchievement.student_profile_id == student_id).all()
    return {
        "id": student.id,
        "user_id": student.user_id,
        "roll_no": student.roll_no,
        "name": student.name,
        "department": student.department,
        "semester": student.semester,
        "email": student.email,
        "bio": student.bio,
        "resume_path": student.resume_path,
        "photo_path": student.photo_path,
        "created_at": student.created_at,
        "skills": [{"id": s.id, "skill_name": s.skill_name, "proficiency": s.proficiency} for s in skills],
        "experiences": [{"id": e.id, "company_name": e.company_name, "title": e.title, "start_date": e.start_date, "end_date": e.end_date, "description": e.description} for e in experiences],
        "certifications": [{"id": c.id, "name": c.name, "issuer": c.issuer, "issue_date": c.issue_date, "expiry_date": c.expiry_date} for c in certifications],
        "soft_skills": [{"id": s.id, "skill_name": s.skill_name} for s in soft_skills],
        "achievements": [{"id": a.id, "title": a.title, "description": a.description, "date": a.date} for a in achievements]
    }

# ---------- Applications ----------
@router.get("/applications")
def list_applications(
    job_id: Optional[int] = None,
    status: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_or_super)
):
    return AdminService.list_applications(db, job_id, status, page, page_size)
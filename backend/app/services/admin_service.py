from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from fastapi import HTTPException, status
from app.models.user import User
from app.models.company import Company
from app.models.student import StudentProfile, StudentSkill, StudentExperience, StudentCertification, StudentSoftSkill, StudentAchievement
from app.models.job import Job, JobSkill
from app.models.application import Application
from app.schemas.company import CompanyUpdateRequest, CompanyStatusUpdateRequest
from app.schemas.job import JobCreateRequest, JobUpdateRequest, JobStatusUpdateRequest
from typing import Optional, List, Dict, Any
from datetime import datetime

class AdminService:
    # ---------- Company Management ----------
    @staticmethod
    def list_companies(
        db: Session,
        status_filter: Optional[str] = None,
        page: int = 1,
        page_size: int = 20
    ) -> Dict[str, Any]:
        query = db.query(Company)
        if status_filter:
            query = query.filter(Company.status == status_filter)
        # Also join user to get email
        query = query.join(User, Company.user_id == User.id)
        total = query.count()
        companies = query.offset((page - 1) * page_size).limit(page_size).all()
        # Build response with email
        result = []
        for comp in companies:
            # comp is Company object, user is joined
            result.append({
                "id": comp.id,
                "company_name": comp.company_name,
                "industry": comp.industry,
                "location": comp.location,
                "status": comp.status,
                "email": comp.user.email,
                "created_at": comp.created_at,
                "updated_at": comp.updated_at,
            })
        return {"total": total, "items": result, "page": page, "page_size": page_size}

    @staticmethod
    def get_company_detail(db: Session, company_id: int) -> Company:
        company = db.query(Company).filter(Company.id == company_id).first()
        if not company:
            raise HTTPException(status_code=404, detail="Company not found")
        return company

    @staticmethod
    def update_company(db: Session, company_id: int, update_data: CompanyUpdateRequest) -> Company:
        company = db.query(Company).filter(Company.id == company_id).first()
        if not company:
            raise HTTPException(status_code=404, detail="Company not found")
        # Update only provided fields
        for field, value in update_data.dict(exclude_unset=True).items():
            setattr(company, field, value)
        db.commit()
        db.refresh(company)
        return company

    @staticmethod
    def approve_company(db: Session, company_id: int, approver_user_id: int) -> Company:
        company = db.query(Company).filter(Company.id == company_id).first()
        if not company:
            raise HTTPException(status_code=404, detail="Company not found")
        if company.status != "pending":
            raise HTTPException(status_code=400, detail="Company is not pending approval")
        company.status = "approved"
        company.approved_by = approver_user_id
        company.approved_at = datetime.utcnow()
        db.commit()
        db.refresh(company)
        return company

    @staticmethod
    def reject_company(db: Session, company_id: int, reason: Optional[str] = None) -> Company:
        company = db.query(Company).filter(Company.id == company_id).first()
        if not company:
            raise HTTPException(status_code=404, detail="Company not found")
        if company.status != "pending":
            raise HTTPException(status_code=400, detail="Company is not pending approval")
        company.status = "rejected"
        # We could store reason in a separate field, but not in schema yet.
        db.commit()
        db.refresh(company)
        return company

    @staticmethod
    def disable_company(db: Session, company_id: int) -> Company:
        company = db.query(Company).filter(Company.id == company_id).first()
        if not company:
            raise HTTPException(status_code=404, detail="Company not found")
        if company.status not in ["approved", "pending"]:
            raise HTTPException(status_code=400, detail="Company cannot be disabled")
        company.status = "disabled"
        db.commit()
        db.refresh(company)
        return company

    @staticmethod
    def update_company_status(db: Session, company_id: int, status_data: CompanyStatusUpdateRequest) -> Company:
        company = db.query(Company).filter(Company.id == company_id).first()
        if not company:
            raise HTTPException(status_code=404, detail="Company not found")
        allowed = ["pending", "approved", "rejected", "disabled", "deleted"]
        if status_data.status not in allowed:
            raise HTTPException(status_code=400, detail="Invalid status")
        company.status = status_data.status
        db.commit()
        db.refresh(company)
        return company

    # ---------- Job Management (Admin) ----------
    @staticmethod
    def create_job(db: Session, job_data: JobCreateRequest, posted_by_user_id: int) -> Job:
        # Verify company exists and is approved
        company = db.query(Company).filter(Company.id == job_data.company_id).first()
        if not company:
            raise HTTPException(status_code=404, detail="Company not found")
        if company.status != "approved":
            raise HTTPException(status_code=400, detail="Company not approved")

        new_job = Job(
            company_id=job_data.company_id,
            posted_by=posted_by_user_id,
            title=job_data.title,
            description=job_data.description,
            requirements=job_data.requirements,
            location=job_data.location,
            employment_type=job_data.employment_type,
            min_cgpa=job_data.min_cgpa,
            salary_min=job_data.salary_min,
            salary_max=job_data.salary_max,
            application_deadline=job_data.application_deadline,
            status=job_data.status or "draft"
        )
        db.add(new_job)
        db.commit()
        db.refresh(new_job)
        return new_job

    @staticmethod
    def update_job(db: Session, job_id: int, update_data: JobUpdateRequest) -> Job:
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        for field, value in update_data.dict(exclude_unset=True).items():
            setattr(job, field, value)
        db.commit()
        db.refresh(job)
        return job

    @staticmethod
    def update_job_status(db: Session, job_id: int, status_data: JobStatusUpdateRequest) -> Job:
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        allowed = ["draft", "published", "closed", "hidden", "deleted"]
        if status_data.status not in allowed:
            raise HTTPException(status_code=400, detail="Invalid status")
        job.status = status_data.status
        db.commit()
        db.refresh(job)
        return job

    @staticmethod
    def list_jobs(
        db: Session,
        filters: Dict = None,
        page: int = 1,
        page_size: int = 20
    ) -> Dict[str, Any]:
        query = db.query(Job)
        if filters:
            if "status" in filters:
                query = query.filter(Job.status == filters["status"])
            if "company_id" in filters:
                query = query.filter(Job.company_id == filters["company_id"])
            # add more filters if needed
        total = query.count()
        jobs = query.offset((page - 1) * page_size).limit(page_size).all()
        # Need company name for display
        result = []
        for job in jobs:
            result.append({
                "id": job.id,
                "company_id": job.company_id,
                "company_name": job.company.company_name if job.company else None,
                "title": job.title,
                "description": job.description,
                "requirements": job.requirements,
                "location": job.location,
                "employment_type": job.employment_type,
                "min_cgpa": job.min_cgpa,
                "salary_min": job.salary_min,
                "salary_max": job.salary_max,
                "application_deadline": job.application_deadline,
                "status": job.status,
                "created_at": job.created_at,
                "updated_at": job.updated_at
            })
        return {"total": total, "items": result, "page": page, "page_size": page_size}

    # ---------- Student Management (Read-only) ----------
    @staticmethod
    def list_students(
        db: Session,
        department: Optional[str] = None,
        semester: Optional[str] = None,
        skills: Optional[str] = None,  # comma separated
        page: int = 1,
        page_size: int = 20
    ) -> Dict[str, Any]:
        query = db.query(StudentProfile)
        if department:
            query = query.filter(StudentProfile.department == department)
        if semester:
            query = query.filter(StudentProfile.semester == semester)
        # Skills filter: need to join student_skills if provided
        if skills:
            skill_list = [s.strip() for s in skills.split(",") if s.strip()]
            # We'll do a subquery or join; for simplicity we do a join and distinct
            query = query.join(StudentSkill).filter(StudentSkill.skill_name.in_(skill_list)).distinct()
        total = query.count()
        students = query.offset((page - 1) * page_size).limit(page_size).all()
        # Build response
        result = []
        for s in students:
            result.append({
                "id": s.id,
                "user_id": s.user_id,
                "roll_no": s.roll_no,
                "name": s.name,
                "department": s.department,
                "semester": s.semester,
                "email": s.email,
                "bio": s.bio,
                "photo_path": s.photo_path,
                "created_at": s.created_at
            })
        return {"total": total, "items": result, "page": page, "page_size": page_size}

    @staticmethod
    def get_student_detail(db: Session, student_id: int) -> StudentProfile:
        student = db.query(StudentProfile).filter(StudentProfile.id == student_id).first()
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")
        return student

    # ---------- Application Viewing (Admin) ----------
    @staticmethod
    def list_applications(
        db: Session,
        job_id: Optional[int] = None,
        status: Optional[str] = None,
        page: int = 1,
        page_size: int = 20
    ) -> Dict[str, Any]:
        query = db.query(Application)
        if job_id:
            query = query.filter(Application.job_id == job_id)
        if status:
            query = query.filter(Application.status == status)
        total = query.count()
        apps = query.offset((page - 1) * page_size).limit(page_size).all()
        # enrich with job title and student name
        result = []
        for app in apps:
            result.append({
                "id": app.id,
                "job_id": app.job_id,
                "job_title": app.job.title if app.job else None,
                "student_name": app.student_profile.name if app.student_profile else None,
                "student_roll_no": app.student_profile.roll_no if app.student_profile else None,
                "status": app.status,
                "applied_at": app.created_at
            })
        return {"total": total, "items": result, "page": page, "page_size": page_size}
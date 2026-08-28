from typing import Any, Dict, List, Optional
from datetime import datetime

from fastapi import HTTPException
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.application import Application
from app.models.company import Company
from app.models.interview import InterviewRequest
from app.models.job import Job
from app.models.student import StudentProfile, StudentSkill
from app.models.user import User
from app.schemas.company import CompanyProfileUpdateRequest
from app.schemas.interview import InterviewRequestCreate, InterviewRequestUpdate
from app.schemas.job import JobCreateRequest, JobStatusUpdateRequest, JobUpdateRequest


class CompanyService:
    @staticmethod
    def get_company_profile(db: Session, user_id: int) -> Company:
        company = db.query(Company).filter(Company.user_id == user_id).first()
        if not company:
            raise HTTPException(status_code=404, detail="Company not found")
        return company

    @staticmethod
    def update_company_profile(db: Session, user_id: int, update_data: CompanyProfileUpdateRequest) -> Company:
        company = db.query(Company).filter(Company.user_id == user_id).first()
        if not company:
            raise HTTPException(status_code=404, detail="Company not found")

        for field, value in update_data.dict(exclude_unset=True).items():
            setattr(company, field, value)

        db.commit()
        db.refresh(company)
        return company

    @staticmethod
    def create_job(db: Session, user_id: int, job_data: JobCreateRequest) -> Job:
        company = db.query(Company).filter(Company.user_id == user_id).first()
        if not company:
            raise HTTPException(status_code=404, detail="Company not found")
        if company.status != "approved":
            raise HTTPException(status_code=403, detail="Company not approved to post jobs")

        new_job = Job(
            company_id=company.id,
            posted_by=user_id,
            title=job_data.title,
            description=job_data.description,
            requirements=job_data.requirements,
            location=job_data.location,
            employment_type=job_data.employment_type,
            min_cgpa=job_data.min_cgpa,
            salary_min=job_data.salary_min,
            salary_max=job_data.salary_max,
            application_deadline=job_data.application_deadline,
            status=job_data.status or "draft",
        )
        db.add(new_job)
        db.commit()
        db.refresh(new_job)
        return new_job

    @staticmethod
    def list_company_jobs(
        db: Session,
        user_id: int,
        status: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> Dict[str, Any]:
        company = db.query(Company).filter(Company.user_id == user_id).first()
        if not company:
            raise HTTPException(status_code=404, detail="Company not found")

        query = db.query(Job).filter(Job.company_id == company.id)
        if status:
            query = query.filter(Job.status == status)

        total = query.count()
        jobs = query.offset((page - 1) * page_size).limit(page_size).all()

        return {
            "total": total,
            "items": jobs,
            "page": page,
            "page_size": page_size,
        }

    @staticmethod
    def get_job(db: Session, job_id: int, user_id: int) -> Job:
        company = db.query(Company).filter(Company.user_id == user_id).first()
        if not company:
            raise HTTPException(status_code=404, detail="Company not found")

        job = db.query(Job).filter(Job.id == job_id, Job.company_id == company.id).first()
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        return job

    @staticmethod
    def update_job(db: Session, job_id: int, user_id: int, update_data: JobUpdateRequest) -> Job:
        company = db.query(Company).filter(Company.user_id == user_id).first()
        if not company:
            raise HTTPException(status_code=404, detail="Company not found")

        job = db.query(Job).filter(Job.id == job_id, Job.company_id == company.id).first()
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        if job.status == "deleted":
            raise HTTPException(status_code=400, detail="Cannot update deleted job")

        for field, value in update_data.dict(exclude_unset=True).items():
            setattr(job, field, value)

        db.commit()
        db.refresh(job)
        return job

    @staticmethod
    def update_job_status(db: Session, job_id: int, user_id: int, status_data: JobStatusUpdateRequest) -> Job:
        company = db.query(Company).filter(Company.user_id == user_id).first()
        if not company:
            raise HTTPException(status_code=404, detail="Company not found")

        job = db.query(Job).filter(Job.id == job_id, Job.company_id == company.id).first()
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")

        allowed = ["draft", "published", "closed", "hidden"]
        if status_data.status not in allowed:
            raise HTTPException(status_code=400, detail="Invalid status")

        job.status = status_data.status
        db.commit()
        db.refresh(job)
        return job

    @staticmethod
    def get_job_applications(
        db: Session,
        job_id: int,
        user_id: int,
        page: int = 1,
        page_size: int = 20,
    ) -> Dict[str, Any]:
        company = db.query(Company).filter(Company.user_id == user_id).first()
        if not company:
            raise HTTPException(status_code=404, detail="Company not found")

        job = db.query(Job).filter(Job.id == job_id, Job.company_id == company.id).first()
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")

        query = db.query(Application).filter(Application.job_id == job_id)
        total = query.count()
        applications = query.offset((page - 1) * page_size).limit(page_size).all()

        result = []
        for app in applications:
            result.append({
                "id": app.id,
                "student_id": app.student_profile_id,
                "student_name": app.student_profile.name if app.student_profile else None,
                "student_roll_no": app.student_profile.roll_no if app.student_profile else None,
                "student_email": app.student_profile.email if app.student_profile else None,
                "cover_letter": app.cover_letter,
                "resume_path": app.resume_path,
                "status": app.status,
                "applied_at": app.created_at,
            })

        return {
            "total": total,
            "items": result,
            "page": page,
            "page_size": page_size,
        }

    @staticmethod
    def get_application_detail(db: Session, application_id: int, user_id: int) -> Application:
        company = db.query(Company).filter(Company.user_id == user_id).first()
        if not company:
            raise HTTPException(status_code=404, detail="Company not found")

        application = (
            db.query(Application)
            .join(Job, Job.id == Application.job_id)
            .filter(Application.id == application_id, Job.company_id == company.id)
            .first()
        )

        if not application:
            raise HTTPException(status_code=404, detail="Application not found")
        return application

    @staticmethod
    def shortlist_candidate(db: Session, application_id: int, user_id: int) -> Application:
        application = CompanyService.get_application_detail(db, application_id, user_id)

        if application.status not in ["applied", "shortlisted"]:
            raise HTTPException(status_code=400, detail="Cannot shortlist this application")

        application.status = "shortlisted"
        db.commit()
        db.refresh(application)
        return application

    @staticmethod
    def create_interview_request(
        db: Session,
        application_id: int,
        user_id: int,
        request_data: InterviewRequestCreate,
    ) -> InterviewRequest:
        application = CompanyService.get_application_detail(db, application_id, user_id)

        existing = db.query(InterviewRequest).filter(InterviewRequest.application_id == application_id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Interview request already sent")

        company = db.query(Company).filter(Company.user_id == user_id).first()
        if not company:
            raise HTTPException(status_code=404, detail="Company not found")

        interview = InterviewRequest(
            company_id=company.id,
            job_id=application.job_id,
            student_profile_id=application.student_profile_id,
            application_id=application_id,
            message=request_data.message,
            interview_date=request_data.interview_date,
            status="pending",
        )
        db.add(interview)
        db.commit()
        db.refresh(interview)
        return interview

    @staticmethod
    def list_interview_requests(
        db: Session,
        user_id: int,
        status: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> Dict[str, Any]:
        company = db.query(Company).filter(Company.user_id == user_id).first()
        if not company:
            raise HTTPException(status_code=404, detail="Company not found")

        query = db.query(InterviewRequest).filter(InterviewRequest.company_id == company.id)
        if status:
            query = query.filter(InterviewRequest.status == status)

        total = query.count()
        interviews = query.offset((page - 1) * page_size).limit(page_size).all()

        result = []
        for interview in interviews:
            result.append({
                "id": interview.id,
                "job_id": interview.job_id,
                "job_title": interview.job.title if interview.job else None,
                "student_profile_id": interview.student_profile_id,
                "student_name": interview.student_profile.name if interview.student_profile else None,
                "student_roll_no": interview.student_profile.roll_no if interview.student_profile else None,
                "application_id": interview.application_id,
                "message": interview.message,
                "interview_date": interview.interview_date,
                "status": interview.status,
                "created_at": interview.created_at,
                "responded_at": interview.responded_at,
            })

        return {
            "total": total,
            "items": result,
            "page": page,
            "page_size": page_size,
        }

    @staticmethod
    def update_interview_request(
        db: Session,
        interview_id: int,
        user_id: int,
        update_data: InterviewRequestUpdate,
    ) -> InterviewRequest:
        company = db.query(Company).filter(Company.user_id == user_id).first()
        if not company:
            raise HTTPException(status_code=404, detail="Company not found")

        interview = db.query(InterviewRequest).filter(
            InterviewRequest.id == interview_id,
            InterviewRequest.company_id == company.id,
        ).first()

        if not interview:
            raise HTTPException(status_code=404, detail="Interview request not found")
        if interview.status != "pending":
            raise HTTPException(status_code=400, detail="Cannot update non-pending request")

        for field, value in update_data.dict(exclude_unset=True).items():
            setattr(interview, field, value)

        if hasattr(interview, "responded_at") and update_data.status:
            interview.responded_at = datetime.utcnow()

        db.commit()
        db.refresh(interview)
        return interview

    @staticmethod
    def search_candidates(
        db: Session,
        user_id: int,
        search_term: Optional[str] = None,
        department: Optional[str] = None,
        semester: Optional[str] = None,
        skills: Optional[List[str]] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> Dict[str, Any]:
        company = db.query(Company).filter(Company.user_id == user_id).first()
        if not company or company.status != "approved":
            raise HTTPException(status_code=403, detail="Company not approved")

        query = db.query(StudentProfile)

        if search_term:
            query = query.filter(
                or_(
                    StudentProfile.name.ilike(f"%{search_term}%"),
                    StudentProfile.roll_no.ilike(f"%{search_term}%"),
                )
            )

        if department:
            query = query.filter(StudentProfile.department == department)

        if semester:
            query = query.filter(StudentProfile.semester == semester)

        if skills:
            query = query.join(StudentSkill).filter(StudentSkill.skill_name.in_(skills)).distinct()

        total = query.count()
        students = query.offset((page - 1) * page_size).limit(page_size).all()

        result = []
        for student in students:
            student_skills = db.query(StudentSkill).filter(StudentSkill.student_profile_id == student.id).all()
            result.append({
                "id": student.id,
                "user_id": student.user_id,
                "roll_no": student.roll_no,
                "name": student.name,
                "department": student.department,
                "semester": student.semester,
                "email": student.email,
                "bio": student.bio,
                "photo_path": student.photo_path,
                "skills": [s.skill_name for s in student_skills],
            })

        return {
            "total": total,
            "items": result,
            "page": page,
            "page_size": page_size,
        }

    @staticmethod
    def get_candidate_detail(db: Session, student_id: int, user_id: int) -> Dict[str, Any]:
        company = db.query(Company).filter(Company.user_id == user_id).first()
        if not company or company.status != "approved":
            raise HTTPException(status_code=403, detail="Company not approved")

        student = db.query(StudentProfile).filter(StudentProfile.id == student_id).first()
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")

        can_see_contact = (
            db.query(InterviewRequest)
            .filter(
                InterviewRequest.company_id == company.id,
                InterviewRequest.student_profile_id == student_id,
                InterviewRequest.status == "accepted",
            )
            .first()
            is not None
        )

        student_skills = db.query(StudentSkill).filter(StudentSkill.student_profile_id == student_id).all()

        response = {
            "id": student.id,
            "user_id": student.user_id,
            "roll_no": student.roll_no,
            "name": student.name,
            "department": student.department,
            "semester": student.semester,
            "email": student.email,
            "bio": student.bio,
            "photo_path": student.photo_path,
            "resume_path": student.resume_path,
            "skills": [
                {"id": s.id, "skill_name": s.skill_name, "proficiency": s.proficiency}
                for s in student_skills
            ],
            "can_see_contact": can_see_contact,
        }

        if can_see_contact:
            response["contact_info"] = {"email": student.email}

        return response

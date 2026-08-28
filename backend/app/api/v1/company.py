from typing import Optional

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.deps import require_role
from app.database import get_db
from app.models.user import User
from app.schemas.company import CompanyProfileUpdateRequest
from app.schemas.interview import InterviewRequestCreate, InterviewRequestUpdate
from app.schemas.job import JobCreateRequest, JobStatusUpdateRequest, JobUpdateRequest
from app.services.company_service import CompanyService

router = APIRouter(prefix="/company", tags=["Company"])
company_only = require_role(["company"])


@router.get("/profile")
def get_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(company_only),
):
    company = CompanyService.get_company_profile(db, current_user.id)
    return {
        "id": company.id,
        "user_id": company.user_id,
        "company_name": company.company_name,
        "website": company.website,
        "industry": company.industry,
        "description": company.description,
        "logo_path": company.logo_path,
        "contact_email": company.contact_email,
        "contact_phone": company.contact_phone,
        "location": company.location,
        "secp_number": company.secp_number,
        "sap_number": company.sap_number,
        "ntn_number": company.ntn_number,
        "secp_document_path": company.secp_document_path,
        "sap_document_path": company.sap_document_path,
        "ntn_document_path": company.ntn_document_path,
        "status": company.status,
        "created_at": company.created_at,
        "updated_at": company.updated_at,
    }


@router.patch("/profile")
def update_profile(
    update_data: CompanyProfileUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(company_only),
):
    company = CompanyService.update_company_profile(db, current_user.id, update_data)
    return {"message": "Profile updated", "company_id": company.id}


@router.post("/jobs", status_code=status.HTTP_201_CREATED)
def create_job(
    job_data: JobCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(company_only),
):
    job = CompanyService.create_job(db, current_user.id, job_data)
    return {"message": "Job created", "job_id": job.id}


@router.get("/jobs")
def list_jobs(
    status: Optional[str] = Query(None, regex="^(draft|published|closed|hidden)$"),
    page: int = 1,
    page_size: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(company_only),
):
    return CompanyService.list_company_jobs(db, current_user.id, status, page, page_size)


@router.get("/jobs/{job_id}")
def get_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(company_only),
):
    job = CompanyService.get_job(db, job_id, current_user.id)
    return {
        "id": job.id,
        "company_id": job.company_id,
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
        "updated_at": job.updated_at,
    }


@router.patch("/jobs/{job_id}")
def update_job(
    job_id: int,
    update_data: JobUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(company_only),
):
    job = CompanyService.update_job(db, job_id, current_user.id, update_data)
    return {"message": "Job updated", "job_id": job.id}


@router.patch("/jobs/{job_id}/status")
def update_job_status(
    job_id: int,
    status_data: JobStatusUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(company_only),
):
    job = CompanyService.update_job_status(db, job_id, current_user.id, status_data)
    return {"message": "Job status updated", "job_id": job.id}


@router.get("/jobs/{job_id}/applications")
def get_job_applications(
    job_id: int,
    page: int = 1,
    page_size: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(company_only),
):
    return CompanyService.get_job_applications(db, job_id, current_user.id, page, page_size)


@router.get("/applications/{application_id}")
def get_application_detail(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(company_only),
):
    application = CompanyService.get_application_detail(db, application_id, current_user.id)
    return {
        "id": application.id,
        "job_id": application.job_id,
        "job_title": application.job.title if application.job else None,
        "student_id": application.student_profile_id,
        "student_name": application.student_profile.name if application.student_profile else None,
        "student_roll_no": application.student_profile.roll_no if application.student_profile else None,
        "student_email": application.student_profile.email if application.student_profile else None,
        "cover_letter": application.cover_letter,
        "resume_path": application.resume_path,
        "status": application.status,
        "applied_at": application.created_at,
    }


@router.post("/applications/{application_id}/shortlist")
def shortlist_candidate(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(company_only),
):
    application = CompanyService.shortlist_candidate(db, application_id, current_user.id)
    return {"message": "Candidate shortlisted", "application_id": application.id}


@router.post("/applications/{application_id}/interview-request")
def create_interview_request(
    application_id: int,
    request_data: InterviewRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(company_only),
):
    interview = CompanyService.create_interview_request(db, application_id, current_user.id, request_data)
    return {"message": "Interview request sent", "interview_request_id": interview.id}


@router.get("/interview-requests")
def list_interview_requests(
    status: Optional[str] = Query(None, regex="^(pending|accepted|declined|cancelled)$"),
    page: int = 1,
    page_size: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(company_only),
):
    return CompanyService.list_interview_requests(db, current_user.id, status, page, page_size)


@router.patch("/interview-requests/{request_id}")
def update_interview_request(
    request_id: int,
    update_data: InterviewRequestUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(company_only),
):
    interview = CompanyService.update_interview_request(db, request_id, current_user.id, update_data)
    return {"message": "Interview request updated", "request_id": interview.id}


@router.get("/candidates/search")
def search_candidates(
    search_term: Optional[str] = None,
    department: Optional[str] = None,
    semester: Optional[str] = None,
    skills: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(company_only),
):
    skill_list = []
    if skills:
        skill_list = [s.strip() for s in skills.split(",") if s.strip()]

    return CompanyService.search_candidates(
        db,
        current_user.id,
        search_term,
        department,
        semester,
        skill_list,
        page,
        page_size,
    )


@router.get("/candidates/{student_id}")
def get_candidate_detail(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(company_only),
):
    return CompanyService.get_candidate_detail(db, student_id, current_user.id)

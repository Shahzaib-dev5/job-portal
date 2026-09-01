import logging
from typing import Optional

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from sqlalchemy.orm import Session

logger = logging.getLogger("uvicorn.error")

from app.database import get_db
from app.models.user import User
from app.api.deps import get_current_user, require_role
from app.schemas.student import (
    AchievementCreateRequest,
    AchievementResponse,
    AchievementUpdateRequest,
    ApplicationCreateRequest,
    ApplicationResponse,
    CertificationCreateRequest,
    CertificationResponse,
    ExperienceCreateRequest,
    ExperienceResponse,
    ExperienceUpdateRequest,
    InterviewRequestResponse,
    JobListResponse,
    SkillCreateRequest,
    SkillResponse,
    SoftSkillCreateRequest,
    SoftSkillResponse,
    StudentProfileResponse,
    StudentProfileUpdateRequest,
)
from app.services.student_service import StudentService

student_only = require_role(["student"])
router = APIRouter(prefix="/students", tags=["students"], dependencies=[Depends(student_only)])


@router.get("/me", response_model=StudentProfileResponse)
def get_my_profile(
    current_user: User = Depends(student_only),
    db: Session = Depends(get_db),
):
    return StudentService.get_student_profile(db, current_user.id)


@router.put("/me", response_model=StudentProfileResponse)
def update_my_profile(
    profile_data: StudentProfileUpdateRequest,
    current_user: User = Depends(student_only),
    db: Session = Depends(get_db),
):
    return StudentService.update_student_profile(db, current_user.id, profile_data)


@router.post("/me/resume", response_model=dict)
def upload_my_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return {"resume_path": StudentService.upload_resume(db, current_user.id, file)}


@router.delete("/me/resume")
def delete_my_resume(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    StudentService.remove_resume(db, current_user.id)
    return {"detail": "Resume deleted"}


@router.post("/me/photo", response_model=dict)
def upload_my_photo(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return {"photo_path": StudentService.upload_photo(db, current_user.id, file)}


@router.delete("/me/photo")
def delete_my_photo(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    StudentService.remove_photo(db, current_user.id)
    return {"detail": "Photo deleted"}


@router.get("/me/skills", response_model=list[SkillResponse])
def list_my_skills(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return StudentService.list_skills(db, current_user.id)


@router.post("/me/skills", response_model=SkillResponse)
def add_my_skill(
    skill_data: SkillCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return StudentService.add_skill(db, current_user.id, skill_data)


@router.delete("/me/skills/{skill_id}")
def delete_my_skill(
    skill_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    StudentService.remove_skill(db, current_user.id, skill_id)
    return {"detail": "Skill deleted"}


@router.get("/me/experiences", response_model=list[ExperienceResponse])
def list_my_experiences(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return StudentService.list_experiences(db, current_user.id)


@router.post("/me/experiences", response_model=ExperienceResponse)
def add_my_experience(
    experience_data: ExperienceCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return StudentService.add_experience(db, current_user.id, experience_data)


@router.put("/me/experiences/{experience_id}", response_model=ExperienceResponse)
def update_my_experience(
    experience_id: int,
    experience_data: ExperienceUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return StudentService.update_experience(db, current_user.id, experience_id, experience_data)


@router.delete("/me/experiences/{experience_id}")
def delete_my_experience(
    experience_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    StudentService.delete_experience(db, current_user.id, experience_id)
    return {"detail": "Experience deleted"}


@router.get("/me/certifications", response_model=list[CertificationResponse])
def list_my_certifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return StudentService.list_certifications(db, current_user.id)


@router.post("/me/certifications", response_model=CertificationResponse)
def add_my_certification(
    certification_data: CertificationCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return StudentService.add_certification(db, current_user.id, certification_data)


@router.delete("/me/certifications/{certification_id}")
def delete_my_certification(
    certification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    StudentService.delete_certification(db, current_user.id, certification_id)
    return {"detail": "Certification deleted"}


@router.get("/me/soft-skills", response_model=list[SoftSkillResponse])
def list_my_soft_skills(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return StudentService.list_soft_skills(db, current_user.id)


@router.post("/me/soft-skills", response_model=SoftSkillResponse)
def add_my_soft_skill(
    soft_skill_data: SoftSkillCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return StudentService.add_soft_skill(db, current_user.id, soft_skill_data)


@router.delete("/me/soft-skills/{soft_skill_id}")
def delete_my_soft_skill(
    soft_skill_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    StudentService.remove_soft_skill(db, current_user.id, soft_skill_id)
    return {"detail": "Soft skill deleted"}


@router.get("/me/achievements", response_model=list[AchievementResponse])
def list_my_achievements(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return StudentService.list_achievements(db, current_user.id)


@router.post("/me/achievements", response_model=AchievementResponse)
def add_my_achievement(
    achievement_data: AchievementCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return StudentService.add_achievement(db, current_user.id, achievement_data)


@router.put("/me/achievements/{achievement_id}", response_model=AchievementResponse)
def update_my_achievement(
    achievement_id: int,
    achievement_data: AchievementUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return StudentService.update_achievement(db, current_user.id, achievement_id, achievement_data)


@router.delete("/me/achievements/{achievement_id}")
def delete_my_achievement(
    achievement_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    StudentService.delete_achievement(db, current_user.id, achievement_id)
    return {"detail": "Achievement deleted"}


@router.get("/jobs", response_model=dict)
def list_jobs(
    title: Optional[str] = Query(None),
    company_name: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    employment_type: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return StudentService.list_published_jobs(
        db,
        user_id=current_user.id,
        title=title,
        company_name=company_name,
        location=location,
        employment_type=employment_type,
        page=page,
        page_size=page_size,
    )


@router.get("/jobs/{job_id}", response_model=dict)
def get_job_detail(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return StudentService.get_job_detail(db, job_id, user_id=current_user.id)


@router.post("/jobs/{job_id}/apply", response_model=dict)
def apply_to_job(
    job_id: int,
    application_data: ApplicationCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        app_data = StudentService.apply_to_job(db, current_user.id, job_id, application_data)
        return {
            "success": True,
            "message": "Application submitted successfully",
            "data": app_data
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error applying to job {job_id} for user {current_user.id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to submit application: {str(e)}")


@router.get("/me/applications", response_model=dict)
def list_my_applications(
    status: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return StudentService.list_applications(db, current_user.id, status=status, page=page, page_size=page_size)


@router.post("/me/applications/{application_id}/withdraw")
def withdraw_my_application(
    application_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    StudentService.withdraw_application(db, current_user.id, application_id)
    return {"detail": "Application withdrawn"}


@router.get("/me/interview-requests", response_model=dict)
def list_my_interview_requests(
    status: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return StudentService.list_interview_requests(db, current_user.id, status=status, page=page, page_size=page_size)


@router.post("/me/interview-requests/{request_id}/accept", response_model=dict)
def accept_interview_request(
    request_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        data = StudentService.accept_interview_request(db, current_user.id, request_id)
        return {
            "success": True,
            "message": "Interview request accepted successfully",
            "data": data
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error accepting interview request {request_id} for user {current_user.id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to accept interview request: {str(e)}")


@router.post("/me/interview-requests/{request_id}/decline", response_model=dict)
def decline_interview_request(
    request_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        data = StudentService.decline_interview_request(db, current_user.id, request_id)
        return {
            "success": True,
            "message": "Interview request declined successfully",
            "data": data
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error declining interview request {request_id} for user {current_user.id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to decline interview request: {str(e)}")

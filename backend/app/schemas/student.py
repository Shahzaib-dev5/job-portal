from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import date, datetime

# ---------- Profile ----------
class StudentProfileUpdateRequest(BaseModel):
    bio: Optional[str] = None


class StudentProfileResponse(BaseModel):
    id: int
    user_id: int
    lms_id: Optional[str]
    roll_no: str
    name: str
    department: str
    semester: str
    email: EmailStr
    bio: Optional[str]
    resume_path: Optional[str]
    photo_path: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ---------- Skills ----------
class SkillCreateRequest(BaseModel):
    skill_name: str
    proficiency: Optional[str] = None


class SkillResponse(BaseModel):
    id: int
    skill_name: str
    proficiency: Optional[str]

    class Config:
        from_attributes = True


# ---------- Experience ----------
class ExperienceCreateRequest(BaseModel):
    company_name: str
    title: str
    start_date: date
    end_date: Optional[date] = None
    description: Optional[str] = None


class ExperienceUpdateRequest(BaseModel):
    company_name: Optional[str] = None
    title: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    description: Optional[str] = None


class ExperienceResponse(BaseModel):
    id: int
    company_name: str
    title: str
    start_date: date
    end_date: Optional[date]
    description: Optional[str]

    class Config:
        from_attributes = True


# ---------- Certifications ----------
class CertificationCreateRequest(BaseModel):
    name: str
    issuer: Optional[str] = None
    issue_date: Optional[date] = None
    expiry_date: Optional[date] = None


class CertificationResponse(BaseModel):
    id: int
    name: str
    issuer: Optional[str]
    issue_date: Optional[date]
    expiry_date: Optional[date]

    class Config:
        from_attributes = True


# ---------- Soft Skills ----------
class SoftSkillCreateRequest(BaseModel):
    skill_name: str


class SoftSkillResponse(BaseModel):
    id: int
    skill_name: str

    class Config:
        from_attributes = True


# ---------- Achievements ----------
class AchievementCreateRequest(BaseModel):
    title: str
    description: Optional[str] = None
    date: Optional[date] = None


class AchievementUpdateRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    date: Optional[date] = None


class AchievementResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    date: Optional[date]

    class Config:
        from_attributes = True


# ---------- Job Browsing ----------
class JobListResponse(BaseModel):
    id: int
    company_id: int
    company_name: str
    title: str
    description: str
    requirements: Optional[str]
    location: Optional[str]
    employment_type: str
    min_cgpa: Optional[float]
    salary_min: Optional[float]
    salary_max: Optional[float]
    application_deadline: Optional[date]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ---------- Applications ----------
class ApplicationCreateRequest(BaseModel):
    cover_letter: Optional[str] = None


class ApplicationResponse(BaseModel):
    id: int
    job_id: int
    job_title: str
    company_name: str
    cover_letter: Optional[str]
    resume_path: Optional[str]
    status: str
    applied_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ---------- Interview Requests ----------
class InterviewRequestResponse(BaseModel):
    id: int
    company_id: int
    company_name: str
    job_id: int
    job_title: str
    message: Optional[str]
    interview_date: Optional[datetime]
    status: str
    created_at: datetime
    responded_at: Optional[datetime]

    class Config:
        from_attributes = True
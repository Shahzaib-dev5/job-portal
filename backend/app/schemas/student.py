from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, List, Any
from datetime import date as date_type, datetime


def parse_optional_date(v: Any) -> Optional[date_type]:
    if not v:
        return None
    if isinstance(v, date_type):
        return v
    if isinstance(v, str):
        v = v.strip()
        if not v:
            return None
        try:
            return datetime.strptime(v, "%Y-%m-%d").date()
        except ValueError:
            pass
        for fmt in ("%m/%d/%Y", "%d/%m/%Y", "%Y/%m/%d", "%m-%d-%Y", "%d-%m-%Y"):
            try:
                return datetime.strptime(v, fmt).date()
            except ValueError:
                pass
    return None


# ---------- Profile ----------
class StudentProfileUpdateRequest(BaseModel):
    professional_title: Optional[str] = None
    location: Optional[str] = None
    hourly_rate: Optional[float] = None
    availability: Optional[str] = None
    languages: Optional[str] = None
    portfolio_url: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    bio: Optional[str] = None
    resume_text: Optional[str] = None


class StudentProfileResponse(BaseModel):
    id: int
    user_id: int
    lms_id: Optional[str]
    roll_no: str
    name: str
    department: str
    semester: str
    email: EmailStr
    professional_title: Optional[str]
    location: Optional[str]
    hourly_rate: Optional[float]
    availability: Optional[str]
    languages: Optional[str]
    portfolio_url: Optional[str]
    github_url: Optional[str]
    linkedin_url: Optional[str]
    bio: Optional[str]
    resume_text: Optional[str]
    resume_path: Optional[str]
    photo_path: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ---------- Skills ----------
class SkillCreateRequest(BaseModel):
    skill_area: Optional[str] = None
    skill_name: str = Field(min_length=1, max_length=100)
    proficiency: Optional[str] = None
    proficiency_percent: Optional[int] = Field(default=None, ge=0, le=100)


class SkillUpdateRequest(BaseModel):
    skill_area: Optional[str] = None
    proficiency: Optional[str] = None
    proficiency_percent: Optional[int] = Field(default=None, ge=0, le=100)


class SkillResponse(BaseModel):
    id: int
    skill_area: Optional[str]
    skill_name: str
    proficiency: Optional[str]
    proficiency_percent: Optional[int]

    class Config:
        from_attributes = True


# ---------- Experience ----------
class ExperienceCreateRequest(BaseModel):
    company_name: str
    title: str
    start_date: date_type
    end_date: Optional[date_type] = None
    description: Optional[str] = None

    @field_validator('start_date', 'end_date', mode='before')
    @classmethod
    def validate_dates(cls, v):
        return parse_optional_date(v)


class ExperienceUpdateRequest(BaseModel):
    company_name: Optional[str] = None
    title: Optional[str] = None
    start_date: Optional[date_type] = None
    end_date: Optional[date_type] = None
    description: Optional[str] = None

    @field_validator('start_date', 'end_date', mode='before')
    @classmethod
    def validate_dates(cls, v):
        return parse_optional_date(v)


class ExperienceResponse(BaseModel):
    id: int
    company_name: str
    title: str
    start_date: date_type
    end_date: Optional[date_type]
    description: Optional[str]

    class Config:
        from_attributes = True


# ---------- Certifications ----------
class CertificationCreateRequest(BaseModel):
    name: str
    issuer: Optional[str] = None
    credential_url: Optional[str] = None
    issue_date: Optional[date_type] = None
    expiry_date: Optional[date_type] = None

    @field_validator('issue_date', 'expiry_date', mode='before')
    @classmethod
    def validate_dates(cls, v):
        return parse_optional_date(v)


class CertificationResponse(BaseModel):
    id: int
    name: str
    issuer: Optional[str]
    credential_url: Optional[str]
    issue_date: Optional[date_type]
    expiry_date: Optional[date_type]

    class Config:
        from_attributes = True


# ---------- Soft Skills ----------
class SoftSkillCreateRequest(BaseModel):
    skill_area: Optional[str] = None
    skill_name: str = Field(min_length=1, max_length=100)
    proficiency_percent: Optional[int] = Field(default=None, ge=0, le=100)


class SoftSkillUpdateRequest(BaseModel):
    skill_area: Optional[str] = None
    proficiency_percent: Optional[int] = Field(default=None, ge=0, le=100)


class SoftSkillResponse(BaseModel):
    id: int
    skill_area: Optional[str]
    skill_name: str
    proficiency_percent: Optional[int]

    class Config:
        from_attributes = True


# ---------- Achievements ----------
class AchievementCreateRequest(BaseModel):
    title: str
    description: Optional[str] = None
    date: Optional[date_type] = None

    @field_validator('date', mode='before')
    @classmethod
    def validate_date(cls, v):
        return parse_optional_date(v)


class AchievementUpdateRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    date: Optional[date_type] = None

    @field_validator('date', mode='before')
    @classmethod
    def validate_date(cls, v):
        return parse_optional_date(v)


class AchievementResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    date: Optional[date_type]

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
    application_deadline: Optional[date_type]
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
    job_title: Optional[str] = ""
    company_name: Optional[str] = ""
    cover_letter: Optional[str] = None
    resume_path: Optional[str] = None
    status: str
    applied_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ---------- Interview Requests ----------
class InterviewRequestResponse(BaseModel):
    id: int
    company_id: int
    company_name: Optional[str] = ""
    job_id: int
    job_title: Optional[str] = ""
    message: Optional[str] = None
    interview_date: Optional[datetime] = None
    status: str
    created_at: Optional[datetime] = None
    responded_at: Optional[datetime] = None

    class Config:
        from_attributes = True

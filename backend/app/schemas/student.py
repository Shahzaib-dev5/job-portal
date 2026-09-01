from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List, Any
from datetime import date, datetime


def parse_optional_date(v: Any) -> Optional[date]:
    if not v:
        return None
    if isinstance(v, date):
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

    @field_validator('start_date', 'end_date', mode='before')
    @classmethod
    def validate_dates(cls, v):
        return parse_optional_date(v)


class ExperienceUpdateRequest(BaseModel):
    company_name: Optional[str] = None
    title: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    description: Optional[str] = None

    @field_validator('start_date', 'end_date', mode='before')
    @classmethod
    def validate_dates(cls, v):
        return parse_optional_date(v)


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

    @field_validator('issue_date', 'expiry_date', mode='before')
    @classmethod
    def validate_dates(cls, v):
        return parse_optional_date(v)


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

    @field_validator('date', mode='before')
    @classmethod
    def validate_date(cls, v):
        return parse_optional_date(v)


class AchievementUpdateRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    date: Optional[date] = None

    @field_validator('date', mode='before')
    @classmethod
    def validate_date(cls, v):
        return parse_optional_date(v)


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
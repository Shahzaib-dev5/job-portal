from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime
from decimal import Decimal

class JobBase(BaseModel):
    title: str
    description: str
    requirements: Optional[str] = None
    location: Optional[str] = None
    employment_type: str  # full_time, part_time, internship, contract, remote
    min_cgpa: Optional[Decimal] = None
    salary_min: Optional[Decimal] = None
    salary_max: Optional[Decimal] = None
    application_deadline: Optional[date] = None
    status: Optional[str] = "draft"  # draft/published/closed/hidden
    skills: List["JobSkillRequest"] = Field(default_factory=list)


class JobSkillRequest(BaseModel):
    skill_area: str
    skill_name: str

class JobCreateRequest(JobBase):
    company_id: int  # admin can specify which company

class JobDraftRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[str] = None
    location: Optional[str] = None
    employment_type: Optional[str] = "full_time"
    min_cgpa: Optional[Decimal] = None
    salary_min: Optional[Decimal] = None
    salary_max: Optional[Decimal] = None
    application_deadline: Optional[date] = None
    status: Optional[str] = "draft"
    skills: Optional[List[JobSkillRequest]] = None

class JobUpdateRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[str] = None
    location: Optional[str] = None
    employment_type: Optional[str] = None
    min_cgpa: Optional[Decimal] = None
    salary_min: Optional[Decimal] = None
    salary_max: Optional[Decimal] = None
    application_deadline: Optional[date] = None
    status: Optional[str] = None
    skills: Optional[List[JobSkillRequest]] = None

class JobStatusUpdateRequest(BaseModel):
    status: str  # draft/published/closed/hidden/deleted

class JobResponse(BaseModel):
    id: int
    company_id: int
    company_name: str  # denormalized for display
    title: str
    description: str
    requirements: Optional[str]
    location: Optional[str]
    employment_type: str
    min_cgpa: Optional[Decimal]
    salary_min: Optional[Decimal]
    salary_max: Optional[Decimal]
    application_deadline: Optional[date]
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
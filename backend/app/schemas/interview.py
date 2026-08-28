from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class InterviewRequestCreate(BaseModel):
    message: Optional[str] = None
    interview_date: Optional[datetime] = None


class InterviewRequestUpdate(BaseModel):
    message: Optional[str] = None
    interview_date: Optional[datetime] = None
    status: Optional[str] = None  # pending/cancelled


class InterviewRequestResponse(BaseModel):
    id: int
    company_id: int
    job_id: int
    job_title: str
    student_profile_id: int
    student_name: str
    student_roll_no: str
    application_id: int
    message: Optional[str]
    interview_date: Optional[datetime]
    status: str
    created_at: datetime
    responded_at: Optional[datetime]

    class Config:
        from_attributes = True

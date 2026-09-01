from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ApplicationSummary(BaseModel):
    id: int
    job_id: int
    job_title: str
    student_name: str
    student_roll_no: str
    status: str  # applied/shortlisted/interviewed/rejected/withdrawn
    applied_at: datetime

    class Config:
        from_attributes = True


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
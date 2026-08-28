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
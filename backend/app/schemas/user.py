from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class AdminCreateRequest(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None

class AdminStatusUpdateRequest(BaseModel):
    status: str  # active/disabled

class AdminResponse(BaseModel):
    id: int
    email: EmailStr
    role: str
    status: str
    name: Optional[str]  # We don't have name in User table, but could add
    created_at: datetime
    updated_at: datetime
    created_by: Optional[int]

    class Config:
        from_attributes = True

class SuperAdminCompanySummary(BaseModel):
    id: int
    company_name: str
    email: EmailStr
    status: str
    created_at: datetime
    updated_at: datetime
    approved_at: Optional[datetime]
    approved_by: Optional[int]

    class Config:
        from_attributes = True
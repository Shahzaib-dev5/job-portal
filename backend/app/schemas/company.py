from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

# --- Request schemas ---

class CompanyUpdateRequest(BaseModel):
    company_name: Optional[str] = None
    website: Optional[str] = None
    industry: Optional[str] = None
    description: Optional[str] = None
    logo_path: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = None
    location: Optional[str] = None

class CompanyStatusUpdateRequest(BaseModel):
    status: str  # pending/approved/rejected/disabled

# --- Response schemas ---

class CompanyBaseResponse(BaseModel):
    id: int
    company_name: str
    industry: Optional[str]
    location: Optional[str]
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class CompanyDetailResponse(CompanyBaseResponse):
    user_id: int
    email: EmailStr  # from user
    website: Optional[str]
    description: Optional[str]
    logo_path: Optional[str]
    contact_email: Optional[EmailStr]
    contact_phone: Optional[str]
    approved_by: Optional[int]
    approved_at: Optional[datetime]


class CompanyProfileResponse(BaseModel):
    id: int
    user_id: int
    company_name: str
    website: Optional[str]
    industry: Optional[str]
    description: Optional[str]
    logo_path: Optional[str]
    contact_email: Optional[EmailStr]
    contact_phone: Optional[str]
    location: Optional[str]
    secp_number: Optional[str]
    sap_number: Optional[str]
    ntn_number: Optional[str]
    secp_document_path: Optional[str]
    sap_document_path: Optional[str]
    ntn_document_path: Optional[str]
    secp_number: Optional[str]
    sap_number: Optional[str]
    ntn_number: Optional[str]
    secp_document_path: Optional[str]
    sap_document_path: Optional[str]
    ntn_document_path: Optional[str]
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CompanyProfileUpdateRequest(BaseModel):
    company_name: Optional[str] = None
    website: Optional[str] = None
    industry: Optional[str] = None
    description: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = None
    location: Optional[str] = None
from pydantic import BaseModel, EmailStr
from typing import Optional

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class StudentLoginRequest(BaseModel):
    email: EmailStr
    password: str

class LMSLoginRequest(BaseModel):
    lms_token: str
    # optionally extra data from frontend

class UserInfo(BaseModel):
    id: int
    email: EmailStr
    name: Optional[str] = None
    role: str
    status: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserInfo

class CompanyRegistrationRequest(BaseModel):
    company_name: str
    email: EmailStr
    password: str
    website: Optional[str] = None
    industry: Optional[str] = None
    location: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = None
    description: Optional[str] = None
    secp_number: Optional[str] = None
    sap_number: Optional[str] = None
    ntn_number: Optional[str] = None

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str
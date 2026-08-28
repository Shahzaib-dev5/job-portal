import os
import shutil
from datetime import datetime

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.auth_services import AuthService
from app.api.deps import get_current_user, require_role
from app.schemas.auth import (
    LoginRequest, StudentLoginRequest, LMSLoginRequest, TokenResponse,
    CompanyRegistrationRequest, UserInfo
)
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = AuthService.authenticate_local(db, request.email, request.password)
    token = AuthService.create_access_token_for_user(user)
    user_info = AuthService.get_user_info(user)
    return TokenResponse(access_token=token, user=user_info)

@router.post("/student/login", response_model=TokenResponse)
async def student_login(request: StudentLoginRequest, db: Session = Depends(get_db)):
    user = await AuthService.authenticate_student_with_odoo(db, request.email, request.password)
    token = AuthService.create_access_token_for_user(user)
    return TokenResponse(access_token=token, user=AuthService.get_user_info(user))

@router.post("/lms-login", response_model=TokenResponse)
async def lms_login(request: LMSLoginRequest, db: Session = Depends(get_db)):
    user = await AuthService.authenticate_lms(db, request.lms_token)
    token = AuthService.create_access_token_for_user(user)
    user_info = AuthService.get_user_info(user)
    return TokenResponse(access_token=token, user=user_info)

@router.post("/company/register", status_code=201)
def register_company(
    company_name: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    website: str | None = Form(None),
    industry: str | None = Form(None),
    location: str | None = Form(None),
    contact_email: str | None = Form(None),
    contact_phone: str | None = Form(None),
    description: str | None = Form(None),
    secp_number: str | None = Form(None),
    sap_number: str | None = Form(None),
    ntn_number: str | None = Form(None),
    secp_document: UploadFile | None = File(None),
    sap_document: UploadFile | None = File(None),
    ntn_document: UploadFile | None = File(None),
    db: Session = Depends(get_db),
):
    data = {
        "company_name": company_name, "email": email, "password": password,
        "website": website, "industry": industry, "location": location,
        "contact_email": contact_email, "contact_phone": contact_phone,
        "description": description, "secp_number": secp_number,
        "sap_number": sap_number, "ntn_number": ntn_number,
    }
    allowed_extensions = {".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx"}
    for document_type, document in (("secp", secp_document), ("sap", sap_document), ("ntn", ntn_document)):
        if not document or not document.filename:
            continue
        extension = os.path.splitext(document.filename)[1].lower()
        if extension not in allowed_extensions:
            raise HTTPException(status_code=400, detail="Documents must be PDF, DOC, DOCX, JPG, JPEG, or PNG files.")

    user = AuthService.register_company(db, data)
    company = user.company_profile
    upload_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "..", "uploads", "company-documents"))
    for document_type, document in (("secp", secp_document), ("sap", sap_document), ("ntn", ntn_document)):
        if not document or not document.filename:
            continue
        extension = os.path.splitext(document.filename)[1].lower()
        os.makedirs(upload_dir, exist_ok=True)
        filename = f"{document_type}_{company.id}_{datetime.now().strftime('%Y%m%d%H%M%S%f')}{extension}"
        filepath = os.path.join(upload_dir, filename)
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(document.file, buffer)
        setattr(company, f"{document_type}_document_path", f"/uploads/company-documents/{filename}")
    db.commit()
    return {"message": "Company registered successfully, pending approval"}

@router.get("/me", response_model=UserInfo)
def get_me(current_user: User = Depends(get_current_user)):
    return AuthService.get_user_info(current_user)

# (Optional) Refresh and logout can be added here, but they are trivial.
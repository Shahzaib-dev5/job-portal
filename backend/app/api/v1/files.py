import os
import shutil
from datetime import datetime

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.api.deps import require_role
from app.database import get_db
from app.models.user import User
from app.services.company_service import CompanyService

UPLOADS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "..", "uploads"))

router = APIRouter(prefix="/files", tags=["Files"])
company_only = require_role(["company"])


@router.post("/company/logo")
def upload_company_logo(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(company_only),
):
    allowed_extensions = {".jpg", ".jpeg", ".png"}
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail="Invalid file format. Use JPG, JPEG, or PNG.")

    company = CompanyService.get_company_profile(db, current_user.id)
    filename = f"logo_{company.id}_{datetime.now().strftime('%Y%m%d%H%M%S%f')}{ext}"
    filepath = os.path.join(UPLOADS_DIR, "logos", filename)
    os.makedirs(os.path.dirname(filepath), exist_ok=True)

    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    company.logo_path = f"/uploads/logos/{filename}"
    db.commit()
    return {"message": "Logo uploaded", "path": company.logo_path}


@router.delete("/company/logo")
def remove_company_logo(
    db: Session = Depends(get_db),
    current_user: User = Depends(company_only),
):
    company = CompanyService.get_company_profile(db, current_user.id)
    if company.logo_path:
        filepath = os.path.join(UPLOADS_DIR, company.logo_path.removeprefix("/uploads/") if company.logo_path.startswith("/uploads/") else company.logo_path.lstrip("/"))
        if os.path.exists(filepath):
            os.remove(filepath)
    company.logo_path = None
    db.commit()
    return {"message": "Logo removed"}

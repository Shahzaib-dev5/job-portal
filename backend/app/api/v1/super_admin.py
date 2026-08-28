from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.api.deps import require_role
from app.models.user import User
from app.services.super_admin_service import SuperAdminService
from app.schemas.user import AdminCreateRequest, AdminStatusUpdateRequest

router = APIRouter(prefix="/super-admin", tags=["Super Admin"])
super_admin_only = require_role(["super_admin"])

# ---------- Admin Management ----------
@router.post("/admins", status_code=status.HTTP_201_CREATED)
def create_admin(
    admin_data: AdminCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(super_admin_only)
):
    """Create a new admin account."""
    admin = SuperAdminService.create_admin(
        db,
        admin_data.email,
        admin_data.password,
        current_user.id,
        admin_data.name
    )
    return {
        "message": "Admin created successfully",
        "admin_id": admin.id,
        "email": admin.email
    }

@router.get("/admins")
def list_admins(
    page: int = 1,
    page_size: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(super_admin_only)
):
    """List all admin accounts with pagination."""
    result = SuperAdminService.list_admins(db, page, page_size)
    # Convert to response format
    items = []
    for admin in result["items"]:
        items.append({
            "id": admin.id,
            "email": admin.email,
            "name": admin.name,
            "role": admin.role,
            "status": admin.status,
            "created_at": admin.created_at,
            "updated_at": admin.updated_at,
            "created_by": admin.created_by
        })
    return {
        "total": result["total"],
        "items": items,
        "page": result["page"],
        "page_size": result["page_size"]
    }

@router.patch("/admins/{admin_id}/status")
def update_admin_status(
    admin_id: int,
    status_data: AdminStatusUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(super_admin_only)
):
    """Enable or disable an admin account."""
    admin = SuperAdminService.update_admin_status(db, admin_id, status_data.status)
    return {
        "message": f"Admin status updated to {status_data.status}",
        "admin_id": admin.id,
        "status": admin.status
    }

@router.delete("/admins/{admin_id}")
def delete_admin(
    admin_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(super_admin_only)
):
    """Soft-delete an admin account."""
    SuperAdminService.delete_admin(db, admin_id)
    return {"message": "Admin deleted successfully"}

# ---------- Company Viewing ----------
@router.get("/companies")
def list_all_companies(
    status: Optional[str] = Query(None, regex="^(pending|approved|rejected|disabled)$"),
    page: int = 1,
    page_size: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(super_admin_only)
):
    """List all companies with status filter (read-only for super admin)."""
    return SuperAdminService.list_all_companies(db, status, page, page_size)
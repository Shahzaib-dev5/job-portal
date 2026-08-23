from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User
from app.models.company import Company
from app.core.security import get_password_hash

class SuperAdminService:
    # ---------- Admin Management ----------
    @staticmethod
    def create_admin(
        db: Session,
        email: str,
        password: str,
        created_by_user_id: int,
        name: str = None
    ) -> User:
        # Check if email already exists
        existing = db.query(User).filter(User.email == email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Create admin user
        hashed = get_password_hash(password)
        user = User(
            email=email,
            password_hash=hashed,
            name=name,
            role="admin",
            auth_provider="local",
            status="active",
            created_by=created_by_user_id
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def list_admins(db: Session, page: int = 1, page_size: int = 20) -> dict:
        query = db.query(User).filter(User.role == "admin")
        total = query.count()
        admins = query.offset((page - 1) * page_size).limit(page_size).all()
        return {
            "total": total,
            "items": admins,
            "page": page,
            "page_size": page_size
        }

    @staticmethod
    def update_admin_status(db: Session, admin_id: int, status: str) -> User:
        admin = db.query(User).filter(
            User.id == admin_id,
            User.role == "admin"
        ).first()
        if not admin:
            raise HTTPException(status_code=404, detail="Admin not found")
        
        if status not in ["active", "disabled"]:
            raise HTTPException(status_code=400, detail="Invalid status")
        
        admin.status = status
        db.commit()
        db.refresh(admin)
        return admin

    @staticmethod
    def delete_admin(db: Session, admin_id: int) -> None:
        admin = db.query(User).filter(
            User.id == admin_id,
            User.role == "admin"
        ).first()
        if not admin:
            raise HTTPException(status_code=404, detail="Admin not found")
        
        # Soft delete
        admin.status = "deleted"
        db.commit()

    # ---------- Company Viewing ----------
    @staticmethod
    def list_all_companies(
        db: Session,
        status_filter: str = None,
        page: int = 1,
        page_size: int = 20
    ) -> dict:
        query = db.query(Company)
        if status_filter:
            query = query.filter(Company.status == status_filter)
        
        # Join with User to get email
        query = query.join(User, Company.user_id == User.id)
        total = query.count()
        companies = query.offset((page - 1) * page_size).limit(page_size).all()
        
        result = []
        for comp in companies:
            result.append({
                "id": comp.id,
                "company_name": comp.company_name,
                "email": comp.user.email,
                "status": comp.status,
                "created_at": comp.created_at,
                "updated_at": comp.updated_at,
                "approved_at": comp.approved_at,
                "approved_by": comp.approved_by
            })
        return {
            "total": total,
            "items": result,
            "page": page,
            "page_size": page_size
        }
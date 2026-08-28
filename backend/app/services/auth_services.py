from sqlalchemy.orm import Session
from app.models.user import User
from app.models.company import Company
from app.models.student import StudentProfile
from app.core.security import get_password_hash, create_access_token
from app.core.lms import authenticate_student, validate_lms_token
from app.schemas.auth import UserInfo
from fastapi import HTTPException, status

class AuthService:
    @staticmethod
    def authenticate_local(db: Session, email: str, password: str) -> User:
        user = db.query(User).filter(User.email == email).first()
        if not user or not user.check_password(password):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        if user.status == "disabled":
            raise HTTPException(status_code=403, detail="Account disabled")
        if user.status == "deleted":
            raise HTTPException(status_code=403, detail="Account deleted")
        if user.role == "company":
            company = db.query(Company).filter(Company.user_id == user.id).first()
            if not company or company.status != "approved":
                raise HTTPException(status_code=403, detail="Company account is awaiting administrator approval")
        return user

    @staticmethod
    def create_access_token_for_user(user: User) -> str:
        token_data = {
            "sub": str(user.id),
            "role": user.role,
            "email": user.email
        }
        return create_access_token(token_data)

    @staticmethod
    def get_user_info(user: User) -> UserInfo:
        return UserInfo(
            id=user.id,
            email=user.email,
            name=user.name,
            role=user.role,
            status=user.status
        )

    @staticmethod
    def register_company(db: Session, reg_data: dict) -> User:
        # Check if email already exists
        existing = db.query(User).filter(User.email == reg_data["email"]).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")

        # Create user
        hashed = get_password_hash(reg_data["password"])
        user = User(
            email=reg_data["email"],
            password_hash=hashed,
            name=reg_data.get("company_name"),
            role="company",
            auth_provider="local",
            status="active"
        )
        db.add(user)
        db.flush()  # to get user.id

        # Create company profile
        company = Company(
            user_id=user.id,
            company_name=reg_data["company_name"],
            website=reg_data.get("website"),
            industry=reg_data.get("industry"),
            description=reg_data.get("description"),
            contact_email=reg_data.get("contact_email"),
            contact_phone=reg_data.get("contact_phone"),
            location=reg_data.get("location"),
            secp_number=reg_data.get("secp_number"),
            sap_number=reg_data.get("sap_number"),
            ntn_number=reg_data.get("ntn_number"),
            status="pending"  # pending admin approval
        )
        db.add(company)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    async def authenticate_lms(db: Session, lms_token: str) -> User:
        lms_data = await validate_lms_token(lms_token)
        return AuthService._provision_student(db, lms_data)

    @staticmethod
    async def authenticate_student_with_odoo(db: Session, email: str, password: str) -> User:
        lms_data = await authenticate_student(email, password)
        return AuthService._provision_student(db, lms_data)

    @staticmethod
    def _provision_student(db: Session, lms_data: dict) -> User:
        student_profile = db.query(StudentProfile).filter(
            (StudentProfile.roll_no == lms_data["roll_no"]) |
            (StudentProfile.lms_id == lms_data.get("lms_id"))
        ).first()

        if student_profile:
            user = student_profile.user
            if user.role != "student":
                raise HTTPException(status_code=400, detail=f"Account is registered as {user.role}")
        else:
            user = db.query(User).filter(User.email == lms_data["email"]).first()
            if user and user.role != "student":
                raise HTTPException(status_code=400, detail=f"Email is registered as {user.role}, not a student")
            if not user:
                user = User(email=lms_data["email"], password_hash=None, name=lms_data["name"], role="student", auth_provider="lms", status="active")
                db.add(user)
                db.flush()
            student_profile = StudentProfile(user_id=user.id, lms_id=lms_data.get("lms_id"), roll_no=lms_data["roll_no"], name=lms_data["name"], department=lms_data["department"], semester=lms_data["semester"], email=lms_data["email"])
            db.add(student_profile)

        if user.status in ("disabled", "deleted"):
            raise HTTPException(status_code=403, detail="Student account inactive")
        user.email = lms_data["email"]
        user.name = lms_data["name"]
        student_profile.lms_id = lms_data.get("lms_id")
        student_profile.name = lms_data["name"]
        student_profile.department = lms_data["department"]
        student_profile.semester = lms_data["semester"]
        student_profile.email = lms_data["email"]
        db.commit()
        db.refresh(user)
        return user
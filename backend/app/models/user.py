from sqlalchemy import BigInteger, Column, DateTime, Enum, ForeignKey, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class User(Base):
    __tablename__ = 'users'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    email = Column(String(255), nullable=False, unique=True)
    password_hash = Column(String(255), nullable=True)
    name = Column(String(255), nullable=True)
    role = Column(Enum('super_admin', 'admin', 'company', 'student'), nullable=False)
    auth_provider = Column(Enum('local', 'lms'), nullable=False, default='local')
    status = Column(Enum('active', 'disabled', 'deleted'), nullable=False, default='active')
    created_by = Column(BigInteger, ForeignKey('users.id'), nullable=True)
    last_login_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())

    company_profile = relationship("Company", back_populates="user", uselist=False, foreign_keys="Company.user_id")
    student_profile = relationship("StudentProfile", back_populates="user", uselist=False)

    posted_jobs = relationship("Job", back_populates="posted_by_user", foreign_keys="Job.posted_by")

    def check_password(self, plain_password: str) -> bool:
        from app.core.security import verify_password
        if not self.password_hash:
            return False
        return verify_password(plain_password, self.password_hash)
from sqlalchemy import BigInteger, Column, Date, DateTime, Enum, ForeignKey, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class StudentProfile(Base):
    __tablename__ = 'student_profiles'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    user_id = Column(BigInteger, ForeignKey('users.id'), nullable=False, unique=True)
    lms_id = Column(String(100), nullable=True)
    roll_no = Column(String(50), nullable=False, unique=True)
    name = Column(String(255), nullable=False)
    department = Column(String(100), nullable=False)
    semester = Column(String(20), nullable=False)
    email = Column(String(255), nullable=False)
    bio = Column(Text, nullable=True)
    resume_path = Column(String(500), nullable=True)
    photo_path = Column(String(500), nullable=True)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="student_profile")
    skills = relationship("StudentSkill", back_populates="student_profile", cascade="all, delete-orphan")
    experiences = relationship("StudentExperience", back_populates="student_profile", cascade="all, delete-orphan")
    certifications = relationship("StudentCertification", back_populates="student_profile", cascade="all, delete-orphan")
    soft_skills = relationship("StudentSoftSkill", back_populates="student_profile", cascade="all, delete-orphan")
    achievements = relationship("StudentAchievement", back_populates="student_profile", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="student_profile", cascade="all, delete-orphan")
    interview_requests = relationship("InterviewRequest", back_populates="student_profile", cascade="all, delete-orphan")


class StudentSkill(Base):
    __tablename__ = 'student_skills'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    student_profile_id = Column(BigInteger, ForeignKey('student_profiles.id'), nullable=False)
    skill_name = Column(String(100), nullable=False)
    proficiency = Column(Enum('beginner', 'intermediate', 'advanced', 'expert'), nullable=True)
    created_at = Column(DateTime, nullable=False, server_default=func.now())

    student_profile = relationship("StudentProfile", back_populates="skills")


class StudentExperience(Base):
    __tablename__ = 'student_experiences'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    student_profile_id = Column(BigInteger, ForeignKey('student_profiles.id'), nullable=False)
    company_name = Column(String(255), nullable=False)
    title = Column(String(255), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())

    student_profile = relationship("StudentProfile", back_populates="experiences")


class StudentCertification(Base):
    __tablename__ = 'student_certifications'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    student_profile_id = Column(BigInteger, ForeignKey('student_profiles.id'), nullable=False)
    name = Column(String(255), nullable=False)
    issuer = Column(String(255), nullable=True)
    issue_date = Column(Date, nullable=True)
    expiry_date = Column(Date, nullable=True)
    created_at = Column(DateTime, nullable=False, server_default=func.now())

    student_profile = relationship("StudentProfile", back_populates="certifications")


class StudentSoftSkill(Base):
    __tablename__ = 'student_soft_skills'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    student_profile_id = Column(BigInteger, ForeignKey('student_profiles.id'), nullable=False)
    skill_name = Column(String(100), nullable=False)
    created_at = Column(DateTime, nullable=False, server_default=func.now())

    student_profile = relationship("StudentProfile", back_populates="soft_skills")


class StudentAchievement(Base):
    __tablename__ = 'student_achievements'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    student_profile_id = Column(BigInteger, ForeignKey('student_profiles.id'), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    date = Column(Date, nullable=True)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())

    student_profile = relationship("StudentProfile", back_populates="achievements")
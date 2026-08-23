from sqlalchemy import BigInteger, Column, Date, DateTime, Enum, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class Job(Base):
    __tablename__ = 'jobs'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    company_id = Column(BigInteger, ForeignKey('companies.id'), nullable=False)
    posted_by = Column(BigInteger, ForeignKey('users.id'), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    requirements = Column(Text, nullable=True)
    location = Column(String(255), nullable=True)
    employment_type = Column(Enum('full_time', 'part_time', 'internship', 'contract', 'remote'), nullable=False, default='full_time')
    min_cgpa = Column(Numeric(4, 2), nullable=True)
    salary_min = Column(Numeric(12, 2), nullable=True)
    salary_max = Column(Numeric(12, 2), nullable=True)
    application_deadline = Column(Date, nullable=True)
    status = Column(Enum('draft', 'published', 'closed', 'hidden', 'deleted'), nullable=False, default='draft')
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())

    company = relationship("Company", back_populates="jobs")
    posted_by_user = relationship("User", back_populates="posted_jobs", foreign_keys=[posted_by])
    applications = relationship("Application", back_populates="job", cascade="all, delete-orphan")
    interview_requests = relationship("InterviewRequest", back_populates="job", cascade="all, delete-orphan")
    job_skills = relationship("JobSkill", back_populates="job", cascade="all, delete-orphan")


class JobSkill(Base):
    __tablename__ = 'job_skills'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    job_id = Column(BigInteger, ForeignKey('jobs.id'), nullable=False)
    skill_name = Column(String(100), nullable=False)
    created_at = Column(DateTime, nullable=False, server_default=func.now())

    job = relationship("Job", back_populates="job_skills")
from sqlalchemy import BigInteger, Column, DateTime, Enum, ForeignKey, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class Application(Base):
    __tablename__ = 'applications'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    job_id = Column(BigInteger, ForeignKey('jobs.id'), nullable=False)
    student_profile_id = Column(BigInteger, ForeignKey('student_profiles.id'), nullable=False)
    cover_letter = Column(Text, nullable=True)
    resume_path = Column(String(500), nullable=True)
    status = Column(Enum('applied', 'shortlisted', 'interviewed', 'rejected', 'withdrawn'), nullable=False, default='applied')
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())

    job = relationship("Job", back_populates="applications")
    student_profile = relationship("StudentProfile", back_populates="applications")
    interview_request = relationship("InterviewRequest", back_populates="application", uselist=False)
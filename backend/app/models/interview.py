from sqlalchemy import BigInteger, Column, DateTime, Enum, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class InterviewRequest(Base):
    __tablename__ = 'interview_requests'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    company_id = Column(BigInteger, ForeignKey('companies.id'), nullable=False)
    job_id = Column(BigInteger, ForeignKey('jobs.id'), nullable=False)
    student_profile_id = Column(BigInteger, ForeignKey('student_profiles.id'), nullable=False)
    application_id = Column(BigInteger, ForeignKey('applications.id'), nullable=False, unique=True)
    message = Column(Text, nullable=True)
    interview_date = Column(DateTime, nullable=True)
    status = Column(Enum('pending', 'accepted', 'declined', 'cancelled'), nullable=False, default='pending')
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    responded_at = Column(DateTime, nullable=True)

    company = relationship("Company", back_populates="interview_requests")
    job = relationship("Job", back_populates="interview_requests")
    student_profile = relationship("StudentProfile", back_populates="interview_requests")
    application = relationship("Application", back_populates="interview_request")
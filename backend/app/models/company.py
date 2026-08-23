from sqlalchemy import BigInteger, Column, DateTime, Enum, ForeignKey, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class Company(Base):
    __tablename__ = 'companies'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    user_id = Column(BigInteger, ForeignKey('users.id'), nullable=False, unique=True)
    company_name = Column(String(255), nullable=False)
    website = Column(String(255), nullable=True)
    industry = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)
    logo_path = Column(String(500), nullable=True)
    contact_email = Column(String(255), nullable=True)
    contact_phone = Column(String(50), nullable=True)
    location = Column(String(255), nullable=True)
    secp_number = Column(String(100), nullable=True)
    sap_number = Column(String(100), nullable=True)
    ntn_number = Column(String(100), nullable=True)
    secp_document_path = Column(String(500), nullable=True)
    sap_document_path = Column(String(500), nullable=True)
    ntn_document_path = Column(String(500), nullable=True)
    status = Column(Enum('pending', 'approved', 'rejected', 'disabled', 'deleted'), nullable=False, default='pending')
    approved_by = Column(BigInteger, ForeignKey('users.id'), nullable=True)
    approved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="company_profile", foreign_keys=[user_id])
    jobs = relationship("Job", back_populates="company")
    interview_requests = relationship("InterviewRequest", back_populates="company")
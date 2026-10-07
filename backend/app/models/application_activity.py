from sqlalchemy import BigInteger, Column, DateTime, ForeignKey, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class ApplicationActivity(Base):
    __tablename__ = 'application_activities'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    application_id = Column(BigInteger, ForeignKey('applications.id', ondelete='CASCADE'), nullable=False)
    actor_user_id = Column(BigInteger, ForeignKey('users.id'), nullable=False)
    action = Column(String(40), nullable=False)
    remarks = Column(Text, nullable=False)
    created_at = Column(DateTime, nullable=False, server_default=func.now())

    application = relationship('Application', back_populates='activities')
    actor = relationship('User')

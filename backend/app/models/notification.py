from sqlalchemy import BigInteger, Boolean, Column, DateTime, ForeignKey, String, Text
from sqlalchemy.sql import func

from app.database import Base


class Notification(Base):
    __tablename__ = 'notifications'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    user_id = Column(BigInteger, ForeignKey('users.id'), nullable=False)
    notification_type = Column(String(50), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, nullable=False, default=False)
    link = Column(String(500), nullable=True)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
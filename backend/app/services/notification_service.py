from typing import Any, Dict, Optional

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.notification import Notification
from app.models.company import Company
from app.models.student import StudentProfile
from app.models.user import User


class NotificationService:
    @staticmethod
    def notify_students_about_job(db: Session, job) -> None:
        """Queue one unread notification for every active student."""
        company = getattr(job, "company", None) or db.query(Company).filter(Company.id == job.company_id).first()
        company_name = company.company_name if company else "A company"
        students = (
            db.query(StudentProfile)
            .join(User, StudentProfile.user_id == User.id)
            .filter(User.status == "active")
            .all()
        )
        for student in students:
            db.add(Notification(
                user_id=student.user_id,
                notification_type="new_job",
                message=f"New job posted by {company_name}: {job.title}",
                link="/js/dashboards/student-dashboard.html?tab=jobs",
                is_read=False,
            ))

    @staticmethod
    def create_notification(
        db: Session,
        user_id: int,
        notification_type: str,
        message: str,
        link: Optional[str] = None,
    ) -> Notification:
        notification = Notification(
            user_id=user_id,
            notification_type=notification_type,
            message=message,
            is_read=False,
            link=link,
        )
        db.add(notification)
        db.commit()
        db.refresh(notification)
        return notification

    @staticmethod
    def list_notifications(
        db: Session,
        user_id: int,
        page: int = 1,
        page_size: int = 20,
    ) -> Dict[str, Any]:
        query = db.query(Notification).filter(Notification.user_id == user_id)
        total = query.count()
        notifications = (
            query.order_by(Notification.created_at.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
            .all()
        )
        return {
            "total": total,
            "items": notifications,
            "page": page,
            "page_size": page_size,
        }

    @staticmethod
    def mark_as_read(db: Session, user_id: int, notification_id: int) -> Notification:
        notification = (
            db.query(Notification)
            .filter(
                Notification.id == notification_id,
                Notification.user_id == user_id,
            )
            .first()
        )
        if not notification:
            raise HTTPException(status_code=404, detail="Notification not found")

        notification.is_read = True
        db.commit()
        db.refresh(notification)
        return notification

    @staticmethod
    def mark_all_as_read(db: Session, user_id: int) -> int:
        count = (
            db.query(Notification)
            .filter(
                Notification.user_id == user_id,
                Notification.is_read.is_(False),
            )
            .update({"is_read": True}, synchronize_session=False)
        )
        db.commit()
        return count

    @staticmethod
    def get_unread_count(db: Session, user_id: int) -> int:
        return (
            db.query(Notification)
            .filter(
                Notification.user_id == user_id,
                Notification.is_read.is_(False),
            )
            .count()
        )

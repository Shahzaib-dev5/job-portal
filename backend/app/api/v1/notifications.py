from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.database import get_db
from app.models.user import User
from app.services.notification_service import NotificationService

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("/")
def list_notifications(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = NotificationService.list_notifications(db, current_user.id, page, page_size)
    return {
        "total": result["total"],
        "items": [
            {
                "id": notification.id,
                "user_id": notification.user_id,
                "notification_type": notification.notification_type,
                "message": notification.message,
                "is_read": notification.is_read,
                "link": notification.link,
                "created_at": notification.created_at,
            }
            for notification in result["items"]
        ],
        "page": result["page"],
        "page_size": result["page_size"],
    }


@router.patch("/{notification_id}/read")
def mark_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notification = NotificationService.mark_as_read(db, current_user.id, notification_id)
    return {"message": "Notification marked as read", "notification_id": notification.id}


@router.patch("/read-all")
def mark_all_as_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    count = NotificationService.mark_all_as_read(db, current_user.id)
    return {"message": f"Marked {count} notifications as read"}


@router.get("/unread-count")
def get_unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    count = NotificationService.get_unread_count(db, current_user.id)
    return {"unread_count": count}

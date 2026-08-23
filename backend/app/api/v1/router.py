from fastapi import APIRouter
from app.api.v1 import auth, admin, super_admin, company, student, notifications, files

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(admin.router)
api_router.include_router(super_admin.router)
api_router.include_router(company.router)
api_router.include_router(student.router)
api_router.include_router(notifications.router)
api_router.include_router(files.router)
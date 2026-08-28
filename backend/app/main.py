from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.v1.router import api_router
from app.config import settings
import os
from pathlib import Path

UPLOADS_DIR = Path(__file__).resolve().parents[3] / 'uploads'

app = FastAPI(title=settings.PROJECT_NAME, version='1.0.0')

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

os.makedirs(UPLOADS_DIR / 'resumes', exist_ok=True)
os.makedirs(UPLOADS_DIR / 'photos', exist_ok=True)
os.makedirs(UPLOADS_DIR / 'logos', exist_ok=True)
app.mount('/uploads', StaticFiles(directory=str(UPLOADS_DIR)), name='uploads')
app.include_router(api_router, prefix=settings.API_V1_PREFIX)

@app.get('/')
def root():
    return {'message': 'Job Portal API', 'docs': '/docs'}
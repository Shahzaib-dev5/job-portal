# Create a test student user and student_profile in the application's database.
# Run from the repository root: python scripts\create_test_student.py

import sys
import os
from pathlib import Path

# Ensure backend package path is on sys.path
ROOT = Path(__file__).resolve().parents[1]
BACKEND_PATH = ROOT / 'backend'
sys.path.insert(0, str(BACKEND_PATH))

from app.database import SessionLocal
from app.core.security import get_password_hash
from app.models.user import User
from app.models.student import StudentProfile


def create_test_student():
    db = SessionLocal()
    try:
        email = 'test.student@example.com'
        existing = db.query(User).filter(User.email == email).first()
        if existing:
            print(f"User with email {email} already exists (id={existing.id}).")
            return

        password = 'TestStudent123'
        hashed = get_password_hash(password)
        user = User(email=email, password_hash=hashed, name='Test Student', role='student', auth_provider='local', status='active')
        db.add(user)
        db.flush()

        profile = StudentProfile(user_id=user.id, lms_id=None, roll_no='TEST001', name='Test Student', department='Computer Science', semester='Fall 2026', email=email)
        db.add(profile)
        db.commit()
        print('Created test student:')
        print('  email:', email)
        print('  password:', password)
        print('  role: student')
        print('  roll_no:', profile.roll_no)
        print('\nYou can sign in using the local login form (choose "Company / Admin" tab and use these credentials)')
    except Exception as e:
        db.rollback()
        print('Failed to create test student:', e)
    finally:
        db.close()


if __name__ == '__main__':
    create_test_student()

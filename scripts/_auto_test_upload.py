import os, sys
from app.config import settings
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from app.core.security import get_password_hash
import requests, base64

def row_to_dict(r):
    try:
        return dict(r._mapping)
    except Exception:
        try:
            return dict(r)
        except Exception:
            return str(r)

engine = create_engine(settings.SQLALCHEMY_DATABASE_URL)
Session = sessionmaker(bind=engine)
session = Session()

print('Connected to DB:', engine.url)
# List existing company users
rows = session.execute(text("SELECT u.id,u.email,u.role,u.status,c.id as company_id,c.company_name,c.logo_path FROM users u LEFT JOIN companies c ON c.user_id=u.id WHERE u.role='company' LIMIT 50")).fetchall()
if rows:
    print('Found company users:')
    for r in rows:
        print(row_to_dict(r))
else:
    print('No company users found')

# Ensure test user exists
test_email='test-company@example.com'
test_password='TestPass123'
user_row = session.execute(text("SELECT id,email FROM users WHERE email=:e"), {'e': test_email}).fetchone()
if not user_row:
    print('Creating test company user')
    pw = get_password_hash(test_password)
    session.execute(text("INSERT INTO users (email,password_hash,name,role,auth_provider,status) VALUES (:email,:pw,:name,'company','local','active')"), {'email': test_email, 'pw': pw, 'name': 'Test Company'})
    session.commit()
    user_row = session.execute(text("SELECT id,email FROM users WHERE email=:e"), {'e': test_email}).fetchone()
    print('Created user:', row_to_dict(user_row))
else:
    print('Test user exists:', row_to_dict(user_row))

user_id = int(row_to_dict(user_row)['id'])
# Ensure company profile exists
comp_row = session.execute(text("SELECT id,company_name,logo_path FROM companies WHERE user_id=:uid"), {'uid': user_id}).fetchone()
if not comp_row:
    print('Creating company profile')
    session.execute(text("INSERT INTO companies (user_id,company_name,status) VALUES (:uid,:name,'approved')"), {'uid': user_id, 'name': 'Test Company'})
    session.commit()
    comp_row = session.execute(text("SELECT id,company_name,logo_path FROM companies WHERE user_id=:uid"), {'uid': user_id}).fetchone()
    print('Created company:', row_to_dict(comp_row))
else:
    print('Company profile exists:', row_to_dict(comp_row))

company_id = int(row_to_dict(comp_row)['id'])
# Login to get token
login_url = 'http://localhost:8000/api/v1/auth/login'
print('Attempting login...')
resp = requests.post(login_url, json={'email': test_email, 'password': test_password}, timeout=10)
print('Login status', resp.status_code)
if resp.status_code!=200:
    print('Login failed, response:', resp.text)
    sys.exit(1)
token = resp.json().get('access_token')
print('Got token:', token[:10]+'...' if token else None)

# Create a small sample PNG file
png_b64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII='
img_data = base64.b64decode(png_b64)
img_path = os.path.join(os.getcwd(),'test-logo.png')
with open(img_path,'wb') as f:
    f.write(img_data)
print('Wrote sample image to', img_path)

# Upload file
upload_url = 'http://localhost:8000/api/v1/files/company/logo'
headers = {'Authorization': f'Bearer {token}'}
with open(img_path,'rb') as f:
    files = {'file': ('test-logo.png', f, 'image/png')}
    upr = requests.post(upload_url, headers=headers, files=files, timeout=30)
print('Upload status', upr.status_code)
print('Upload response:', upr.text)

# Check DB company.logo_path
comp2 = session.execute(text('SELECT logo_path FROM companies WHERE id=:cid'), {'cid': company_id}).fetchone()
print('Company logo_path in DB:', row_to_dict(comp2) if comp2 else None)

# Verify file exists on disk
uploads_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend', 'uploads', 'logos'))
print('Uploads logos folder (guess):', uploads_dir)
logo_path = row_to_dict(comp2).get('logo_path') if comp2 else None
if logo_path:
    rel = logo_path.lstrip('/')
    fullpath = os.path.join(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')), rel)
    print('Computed fullpath:', fullpath)
    print('File exists:', os.path.exists(fullpath))

print('DONE')


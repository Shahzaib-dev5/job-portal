from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.api.deps import require_role
from app.database import get_db
from app.models.job import JobSkill
from app.models.student import StudentSkill

router = APIRouter(prefix="/skills", tags=["Skills"])
authenticated = require_role(["student", "company", "admin", "super_admin"])

DEGREE_SKILLS = {
    "Computer Science": {
        "Software Development": ["Python", "Java", "C++", "JavaScript", "TypeScript", "React", "Node.js", "Django", "FastAPI", "SQL", "Git", "REST APIs"],
        "Data Science & AI": ["Python", "Data Analysis", "Data Science", "Machine Learning", "Deep Learning", "NLP", "Computer Vision", "TensorFlow", "PyTorch", "SQL"],
        "Cybersecurity": ["Network Security", "Ethical Hacking", "Penetration Testing", "SIEM", "Cryptography", "Linux", "Python"],
    },
    "Information Technology": {
        "Software Development": ["Python", "Java", "JavaScript", "React", "Node.js", "SQL", "Git", "REST APIs"],
        "Networking & Cloud": ["Network Administration", "AWS", "Azure", "Docker", "Kubernetes", "Linux", "TCP/IP"],
        "IT Support": ["Troubleshooting", "System Administration", "Microsoft 365", "Help Desk", "Windows Server", "Linux"],
    },
    "Software Engineering": {
        "Software Development": ["Python", "Java", "C++", "C#", "JavaScript", "TypeScript", "React", "Angular", "Node.js", "Django", "Spring Boot", "Git"],
        "QA & Testing": ["Manual Testing", "Test Automation", "Selenium", "Cypress", "Jest", "API Testing", "Quality Assurance"],
        "DevOps & Cloud": ["Docker", "Kubernetes", "CI/CD", "AWS", "Azure", "Terraform", "Linux"],
    },
    "Electrical Engineering": {
        "Electronics & Embedded Systems": ["Embedded Systems", "Arduino", "Raspberry Pi", "MATLAB", "PCB Design", "Microcontrollers", "Circuit Design"],
        "Power & Control": ["Power Systems", "Control Systems", "PLC", "AutoCAD", "MATLAB", "Electrical Design"],
    },
    "Business Administration": {
        "Business & Management": ["Project Management", "Business Analysis", "Strategic Planning", "Microsoft Excel", "Operations Management", "Leadership"],
        "Marketing & Sales": ["Digital Marketing", "SEO", "Content Marketing", "Market Research", "Google Ads", "Sales", "CRM"],
        "Finance & Accounting": ["Financial Analysis", "Accounting", "Financial Modeling", "Microsoft Excel", "QuickBooks", "Auditing"],
    },
    "Accounting & Finance": {
        "Finance & Accounting": ["Financial Analysis", "Accounting", "Financial Modeling", "Microsoft Excel", "QuickBooks", "Auditing", "Taxation"],
    },
    "Engineering": {
        "Engineering & Design": ["AutoCAD", "SolidWorks", "MATLAB", "Project Management", "Technical Drawing", "Quality Control"],
        "Manufacturing & Operations": ["Lean Manufacturing", "Six Sigma", "Supply Chain", "Production Planning", "Quality Assurance"],
    },
    "Design": {
        "UI/UX & Creative Design": ["UI Design", "UX Design", "Figma", "Adobe Photoshop", "Adobe Illustrator", "Graphic Design", "Prototyping", "Wireframing", "Motion Design"],
    },
    "Arts & Humanities": {
        "Communication & Media": ["Technical Writing", "Content Writing", "Copywriting", "Public Speaking", "Research", "Social Media Marketing"],
    },
    "Any degree": {
        "General": ["Communication", "Teamwork", "Problem Solving", "Critical Thinking", "Time Management", "Leadership", "Research", "Microsoft Office"],
    },
}

DEGREES = list(DEGREE_SKILLS)
AREAS = sorted({area for degree_areas in DEGREE_SKILLS.values() for area in degree_areas})


@router.get("/suggestions")
def skill_suggestions(
    q: str = Query("", max_length=100),
    limit: int = Query(12, ge=1, le=50),
    degree: str = Query("", max_length=150),
    area: str = Query("", max_length=150),
    _: object = Depends(authenticated),
    db: Session = Depends(get_db),
):
    term = q.strip().lower()
    name_filter = f"{term}%"
    rows = db.query(StudentSkill.skill_area, StudentSkill.skill_name).filter(
        or_(StudentSkill.skill_name.ilike(name_filter), StudentSkill.skill_area.ilike(name_filter))
    ).distinct().all() if term else db.query(StudentSkill.skill_area, StudentSkill.skill_name).distinct().all()
    job_rows = db.query(JobSkill.skill_area, JobSkill.skill_name).filter(
        or_(JobSkill.skill_name.ilike(name_filter), JobSkill.skill_area.ilike(name_filter))
    ).distinct().all() if term else db.query(JobSkill.skill_area, JobSkill.skill_name).distinct().all()
    values = {(skill_area or "Other", name) for skill_area, name in [*rows, *job_rows] if name}
    catalog_degrees = [degree] if degree in DEGREE_SKILLS and degree != "All degrees" else DEGREES
    for selected_degree in catalog_degrees:
        for skill_area, names in DEGREE_SKILLS[selected_degree].items():
            if area.strip() and area.strip().lower() not in {"all areas", "__all__"} and skill_area.lower() != area.strip().lower():
                continue
            values.update((skill_area, name) for name in names)
    if term:
        values = {(skill_area, name) for skill_area, name in values if name.lower().startswith(term)}
    return [{"skill_area": skill_area, "skill_name": name} for skill_area, name in sorted(values, key=lambda item: item[1].lower())[:limit]]


@router.get("/catalog")
def skill_catalog(_: object = Depends(authenticated)):
    return {"degrees": DEGREES, "areas": AREAS, "skills": DEGREE_SKILLS}

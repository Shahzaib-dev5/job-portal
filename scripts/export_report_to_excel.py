import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

def create_ultra_premium_excel_report():
    wb = openpyxl.Workbook()
    wb.remove(wb.active)  # remove default sheet

    # Color Palette - Executive Navy & Slate
    NAVY_PRIMARY = "0F2C59"
    NAVY_SECONDARY = "1F4E78"
    SLATE_HEADER = "2C3E50"
    ICE_BLUE_CARD = "F0F4F8"
    BORDER_COLOR = "D0D7DE"
    
    # Fills
    title_fill = PatternFill(start_color=NAVY_PRIMARY, end_color=NAVY_PRIMARY, fill_type="solid")
    header_fill = PatternFill(start_color=NAVY_SECONDARY, end_color=NAVY_SECONDARY, fill_type="solid")
    subheader_fill = PatternFill(start_color=SLATE_HEADER, end_color=SLATE_HEADER, fill_type="solid")
    card_fill = PatternFill(start_color=ICE_BLUE_CARD, end_color=ICE_BLUE_CARD, fill_type="solid")
    
    status_done_fill = PatternFill(start_color="D4EDDA", end_color="D4EDDA", fill_type="solid")
    status_done_font = Font(name="Calibri", size=11, bold=True, color="155724")

    priority_high_fill = PatternFill(start_color="F8D7DA", end_color="F8D7DA", fill_type="solid")
    priority_high_font = Font(name="Calibri", size=11, bold=True, color="721C24")

    priority_med_fill = PatternFill(start_color="FFF3CD", end_color="FFF3CD", fill_type="solid")
    priority_med_font = Font(name="Calibri", size=11, bold=True, color="856404")

    # Fonts
    font_main_title = Font(name="Calibri", size=18, bold=True, color="FFFFFF")
    font_section_title = Font(name="Calibri", size=14, bold=True, color=NAVY_PRIMARY)
    font_header = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
    font_card_num = Font(name="Calibri", size=16, bold=True, color=NAVY_PRIMARY)
    font_card_label = Font(name="Calibri", size=9, bold=True, color="555555")
    font_bold = Font(name="Calibri", size=11, bold=True)
    font_regular = Font(name="Calibri", size=11)
    font_italic = Font(name="Calibri", size=10, italic=True, color="666666")

    # Borders
    thin_border = Border(
        left=Side(style='thin', color=BORDER_COLOR),
        right=Side(style='thin', color=BORDER_COLOR),
        top=Side(style='thin', color=BORDER_COLOR),
        bottom=Side(style='thin', color=BORDER_COLOR)
    )
    thick_bottom_border = Border(
        left=Side(style='thin', color=BORDER_COLOR),
        right=Side(style='thin', color=BORDER_COLOR),
        top=Side(style='thin', color=BORDER_COLOR),
        bottom=Side(style='medium', color=NAVY_PRIMARY)
    )

    def style_title_banner(ws, title_text, col_span=6):
        ws.row_dimensions[1].height = 40
        ws.merge_cells(start_row=1, start_column=1, end_row=1, end_column=col_span)
        cell = ws.cell(row=1, column=1, value=title_text)
        cell.font = font_main_title
        cell.fill = title_fill
        cell.alignment = Alignment(horizontal="center", vertical="center")
        for col in range(1, col_span + 1):
            ws.cell(row=1, column=col).fill = title_fill

    def create_kpi_cards(ws, cards, start_row=3):
        ws.row_dimensions[start_row].height = 20
        ws.row_dimensions[start_row+1].height = 28
        for i, (label, val) in enumerate(cards):
            col = i * 2 + 1
            ws.merge_cells(start_row=start_row, start_column=col, end_row=start_row, end_column=col+1)
            ws.merge_cells(start_row=start_row+1, start_column=col, end_row=start_row+1, end_column=col+1)
            
            c_label = ws.cell(row=start_row, column=col, value=label.upper())
            c_label.font = font_card_label
            c_label.fill = card_fill
            c_label.alignment = Alignment(horizontal="center", vertical="center")

            c_val = ws.cell(row=start_row+1, column=col, value=val)
            c_val.font = font_card_num
            c_val.fill = card_fill
            c_val.alignment = Alignment(horizontal="center", vertical="center")

            for r in range(start_row, start_row+2):
                for c in range(col, col+2):
                    ws.cell(row=r, column=c).border = thin_border
                    ws.cell(row=r, column=c).fill = card_fill

    def style_table_headers(ws, row_idx, headers):
        ws.row_dimensions[row_idx].height = 28
        for col_idx, text in enumerate(headers, start=1):
            cell = ws.cell(row=row_idx, column=col_idx, value=text)
            cell.font = font_header
            cell.fill = header_fill
            cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
            cell.border = thick_bottom_border

    def autofit_sheet_columns(ws, max_cols=None):
        ws.views.sheetView[0].showGridLines = True
        limit = max_cols if max_cols else ws.max_column
        for col in range(1, limit + 1):
            col_letter = get_column_letter(col)
            max_len = 0
            for row in range(1, ws.max_row + 1):
                cell = ws.cell(row=row, column=col)
                if cell.value is not None:
                    val_str = str(cell.value)
                    if "\n" in val_str:
                        lines = val_str.split("\n")
                        max_len = max(max_len, max(len(l) for l in lines))
                    else:
                        max_len = max(max_len, len(val_str))
            ws.column_dimensions[col_letter].width = max(min(max_len + 4, 65), 14)

    # =============================================================
    # TAB 1: Executive_Summary
    # =============================================================
    ws1 = wb.create_sheet(title="Executive_Summary")
    style_title_banner(ws1, "CareerConnect Job Portal - Master Project Report", 6)
    
    kpis_1 = [
        ("Project Leads", "Liqae & Shahryar"),
        ("Architecture", "FastAPI + JS"),
        ("API Endpoints", "35 Specs"),
        ("Database Tables", "14 Tables")
    ]
    create_kpi_cards(ws1, kpis_1, start_row=3)

    ws1.cell(row=6, column=1, value="1. Project Identification & Team Credits").font = font_section_title
    headers_info = ["Attribute", "Specification & Details"]
    style_table_headers(ws1, 7, headers_info)
    
    proj_info = [
        ("System Name", "CareerConnect University Job Portal"),
        ("Project Leads & Key Engineers", "Liqae (Lead Systems Architect & Backend Engineer)\nShahryar (Principal Full-Stack Engineer & Database Designer)"),
        ("Organization", "University of Engineering & Technology (UET)"),
        ("Development Stack", "Backend: FastAPI (Python 3.14), Pydantic v2, SQLAlchemy 2.0 ORM, PyMySQL, JWT Auth\nFrontend: Vanilla HTML5, Custom CSS, Modular JavaScript, Component UI\nDatabase: MySQL / MariaDB (Database Name: job_portal)"),
        ("Target Users & Roles", "1. Students (Profile Builder, Resume Upload, Job Applications, Interview Tracking)\n2. Companies (Corporate Verification SECP/NTN/SAP, Job Posting, Candidate Search, Shortlisting)\n3. Administrators (Company Verification, Job Moderation, Portal Oversight)\n4. Super Administrators (Admin User Management, System Analytics, Global Controls)"),
        ("Verification Standards", "Corporate SECP Registration Number, SAP Corporate ID, National Tax Number (NTN), Verification Document Uploads (PDF/PNG/JPG)")
    ]

    for r_idx, (k, v) in enumerate(proj_info, start=8):
        ws1.row_dimensions[r_idx].height = 42 if "\n" in v else 24
        c1 = ws1.cell(row=r_idx, column=1, value=k)
        c2 = ws1.cell(row=r_idx, column=2, value=v)
        c1.font = font_bold
        c2.font = font_regular
        c1.border = thin_border
        c2.border = thin_border
        c1.alignment = Alignment(vertical="center")
        c2.alignment = Alignment(vertical="center", wrap_text=True)

    ws1.cell(row=15, column=1, value="2. Seeded System Accounts").font = font_section_title
    headers_accounts = ["Role Title", "Assigned Lead / Owner", "Email Address", "Default Password", "Access Level & Scope"]
    style_table_headers(ws1, 16, headers_accounts)

    accounts_data = [
        ("Super Administrator", "Liqae & Shahryar", "superadmin@jobportal.com", "admin123", "Full system privileges, admin user management, platform audit logs"),
        ("Administrator", "Liqae & Shahryar", "admin@uetjobportal.com", "admin123", "Company approval/rejection workflows, document verification, portal moderation")
    ]
    for r_idx, row in enumerate(accounts_data, start=17):
        ws1.row_dimensions[r_idx].height = 24
        for c_idx, val in enumerate(row, start=1):
            cell = ws1.cell(row=r_idx, column=c_idx, value=val)
            cell.font = font_regular
            cell.border = thin_border
            cell.alignment = Alignment(vertical="center")

    autofit_sheet_columns(ws1, 6)

    # =============================================================
    # TAB 2: Team_&_Resource_Allocation
    # =============================================================
    ws2 = wb.create_sheet(title="Team_&_Resource_Allocation")
    style_title_banner(ws2, "Project Team Ownership & Module Allocation Matrix", 7)

    headers_team = ["Module / Feature Area", "Primary Assigned Lead", "Co-Engineer / Reviewer", "Key Responsibilities", "Deliverables Produced", "Verification Status"]
    style_table_headers(ws2, 3, headers_team)

    team_matrix = [
        ("Backend Architecture & REST Core", "Liqae", "Shahryar", "FastAPI setup, Uvicorn server, Pydantic schemas, dependency injection middleware", "backend/app/main.py, config.py, deps.py", "Completed"),
        ("Database Schema & Migration Engine", "Shahryar", "Liqae", "MySQL schema design, foreign keys, 8 migration scripts, seed data generator", "database/schema.sql, migrations/*.sql", "Completed"),
        ("Authentication & Security Module", "Liqae", "Shahryar", "JWT token generation, OAuth2 password flow, password hashing, LMS auth integration", "backend/app/api/v1/auth.py, services/auth_service.py", "Completed"),
        ("Student Marketplace & Profiles", "Shahryar", "Liqae", "Student profile CRUD, skill percentages, experience/certification models, resume uploads", "backend/app/api/v1/student.py, skills.py", "Completed"),
        ("Company Verification & Corporate Onboarding", "Liqae", "Shahryar", "SECP/NTN/SAP document upload, status workflow (pending -> approved/rejected)", "backend/app/api/v1/company.py, files.py", "Completed"),
        ("Job Management & Applicant Tracking", "Shahryar", "Liqae", "Job postings, application submission, shortlisting, candidate search engine", "backend/app/api/v1/company.py, student.py", "Completed"),
        ("Interview Scheduling & Notifications", "Liqae", "Shahryar", "Interview request workflow (date slots, accept/decline), notification triggers", "backend/app/api/v1/notifications.py, interview models", "Completed"),
        ("Admin & Super Admin Portals", "Shahryar", "Liqae", "Company approval UI, admin account creation, super admin dashboard endpoints", "backend/app/api/v1/admin.py, super_admin.py", "Completed"),
        ("Frontend Presentation & Shared JS Engine", "Liqae & Shahryar", "Liqae & Shahryar", "Dynamic HTML dashboards, CSS styles, api.js HTTP client, auth.js router", "frontend/*, dashboards/*.html, js/*.js", "Completed")
    ]

    for r_idx, row in enumerate(team_matrix, start=4):
        ws2.row_dimensions[r_idx].height = 26
        for c_idx, val in enumerate(row, start=1):
            cell = ws2.cell(row=r_idx, column=c_idx, value=val)
            cell.border = thin_border
            if c_idx in [2, 3]:
                cell.font = font_bold
                cell.alignment = Alignment(horizontal="center", vertical="center")
            elif c_idx == 6 and val == "Completed":
                cell.fill = status_done_fill
                cell.font = status_done_font
                cell.alignment = Alignment(horizontal="center", vertical="center")
            else:
                cell.font = font_regular
                cell.alignment = Alignment(vertical="center", wrap_text=True)

    autofit_sheet_columns(ws2, 7)

    # =============================================================
    # TAB 3: Architecture_&_Design
    # =============================================================
    ws3 = wb.create_sheet(title="Architecture_&_Design")
    style_title_banner(ws3, "Multi-Layer System Architecture & Technical Specifications", 5)

    headers_arch = ["Layer Level", "Layer Name", "Technology Stack", "Design Patterns & Implementation Details", "Lead Architectural Designers"]
    style_table_headers(ws3, 3, headers_arch)

    arch_details = [
        ("Layer 1", "Presentation Layer", "HTML5, Vanilla CSS, Modular JS, Custom Components", "Decoupled SPA UI served on port 3000. Shared api.js client intercepts requests and appends JWT Bearer headers from localStorage.", "Liqae & Shahryar"),
        ("Layer 2", "API & Routing Layer", "FastAPI (Python 3.14), APIRouter, OAuth2", "Exposes REST endpoints under /api/v1 prefix. Uses dependency injection (deps.py) to enforce role guards for student, company, admin, super_admin.", "Liqae"),
        ("Layer 3", "Service & Business Logic", "Auth Service, Resume Service, Verification Engine", "Enforces corporate registration validation (SECP/NTN/SAP), handles LMS API session handshakes, executes resume parsing routines.", "Liqae & Shahryar"),
        ("Layer 4", "Data Access & ORM Layer", "SQLAlchemy 2.0 ORM, PyMySQL, Pydantic v2", "Translates Python models into relational SQL queries. Pydantic schemas validate request inputs and format strict JSON responses.", "Shahryar"),
        ("Layer 5", "Relational Database Layer", "MySQL / MariaDB (job_portal)", "Stores relational entities with foreign key cascades, unique constraints (roll_no, email, SECP), and index optimizations.", "Shahryar")
    ]

    for r_idx, row in enumerate(arch_details, start=4):
        ws3.row_dimensions[r_idx].height = 36
        for c_idx, val in enumerate(row, start=1):
            cell = ws3.cell(row=r_idx, column=c_idx, value=val)
            cell.border = thin_border
            cell.alignment = Alignment(vertical="center", wrap_text=True)
            if c_idx in [1, 2, 5]:
                cell.font = font_bold
            else:
                cell.font = font_regular

    autofit_sheet_columns(ws3, 5)

    # =============================================================
    # TAB 4: Gantt_&_Project_Phases
    # =============================================================
    ws4 = wb.create_sheet(title="Gantt_&_Project_Phases")
    style_title_banner(ws4, "Detailed Development Phase Schedule & Deliverables Timeline", 6)

    headers_gantt = ["Phase Name", "Task / Module Description", "Assigned Lead", "Target Duration", "Deliverables & Output Files", "Execution Status"]
    style_table_headers(ws4, 3, headers_gantt)

    gantt_detailed = [
        ("Phase 1: Requirements & Planning", "Requirement Gathering & SRS Specification", "Liqae & Shahryar", "3 Days", "SRS Document & Software Planning Sheet", "Completed"),
        ("Phase 1: Requirements & Planning", "Architecture & Technology Stack Selection", "Liqae", "3 Days", "FastAPI + Vanilla JS Architecture Specification", "Completed"),
        ("Phase 1: Requirements & Planning", "Relational Database Schema Design", "Shahryar", "3 Days", "schema.sql & 8 Migration Scripts", "Completed"),
        ("Phase 2: Backend Core Development", "Database ORM Models & Connections Setup", "Shahryar", "5 Days", "database.py & app/models/*.py", "Completed"),
        ("Phase 2: Backend Core Development", "JWT Authentication & LMS Handshake Integration", "Liqae", "3 Days", "routers/auth.py & services/auth_service.py", "Completed"),
        ("Phase 2: Backend Core Development", "Student Profile & Marketplace APIs", "Shahryar", "5 Days", "routers/student.py & routers/skills.py", "Completed"),
        ("Phase 2: Backend Core Development", "Company Onboarding & Verification APIs", "Liqae", "4 Days", "routers/company.py & routers/files.py", "Completed"),
        ("Phase 2: Backend Core Development", "Admin & Super Admin Moderation APIs", "Shahryar", "4 Days", "routers/admin.py & super_admin.py", "Completed"),
        ("Phase 3: Frontend Application Development", "Auth Interfaces (Login, LMS Modal, Company Registration)", "Liqae", "4 Days", "login.html, register-company.html", "Completed"),
        ("Phase 3: Frontend Application Development", "Student Dashboard & Profile Builder UI", "Shahryar", "6 Days", "dashboards/student-dashboard.html & .js", "Completed"),
        ("Phase 3: Frontend Application Development", "Company Dashboard & Applicant Tracking UI", "Liqae", "6 Days", "dashboards/company-dashboard.html & .js", "Completed"),
        ("Phase 3: Frontend Application Development", "Admin & Super Admin Dashboards", "Shahryar", "4 Days", "admin-dashboard.html & super-admin-dashboard.html", "Completed"),
        ("Phase 4: Integration & Storage", "File Upload Handler & Resume Storage System", "Liqae & Shahryar", "3 Days", "Upload Service & /uploads Directory", "Completed"),
        ("Phase 4: Integration & Storage", "Notification Engine Integration", "Liqae", "3 Days", "routers/notifications.py & DB Trigger Handler", "Completed"),
        ("Phase 5: Testing & Go-Live", "Automated Pytest Suite & Validation Scripts", "Shahryar", "3 Days", "backend/tests/test_auth.py & test_date_validation.py", "Completed"),
        ("Phase 5: Testing & Go-Live", "Production Readiness & Python 3.14 Compatibility", "Liqae & Shahryar", "2 Days", "requirements.txt, setup.ps1, run scripts", "Completed")
    ]

    for r_idx, row in enumerate(gantt_detailed, start=4):
        ws4.row_dimensions[r_idx].height = 24
        for c_idx, val in enumerate(row, start=1):
            cell = ws4.cell(row=r_idx, column=c_idx, value=val)
            cell.border = thin_border
            cell.alignment = Alignment(vertical="center")
            if c_idx == 3:
                cell.font = font_bold
                cell.alignment = Alignment(horizontal="center", vertical="center")
            elif c_idx == 6 and val == "Completed":
                cell.fill = status_done_fill
                cell.font = status_done_font
                cell.alignment = Alignment(horizontal="center", vertical="center")
            else:
                cell.font = font_regular

    autofit_sheet_columns(ws4, 6)

    # =============================================================
    # TAB 5: Backend_API_Specification
    # =============================================================
    ws5 = wb.create_sheet(title="Backend_API_Specification")
    style_title_banner(ws5, "Ultra-Detailed Backend REST API Endpoint Specification Matrix", 9)

    headers_api = ["Sr #", "Module Category", "Endpoint URL", "HTTP Method", "Access Rights", "Payload / Query Parameters", "Response Code & Schema", "Lead Developer", "Status"]
    style_table_headers(ws5, 3, headers_api)

    api_specs = [
        # Auth
        (1, "Authentication", "/api/v1/auth/login", "POST", "Public", "JSON: {username, password}", "200 OK -> {access_token, token_type, role}", "Liqae", "Completed"),
        (2, "Authentication", "/api/v1/auth/student/login", "POST", "Public", "JSON: {email, password}", "200 OK -> {access_token, token_type, student_profile}", "Liqae", "Completed"),
        (3, "Authentication", "/api/v1/auth/lms-login", "POST", "Public", "JSON: {username, password}", "200 OK -> LMS Token & Student Record", "Liqae", "Completed"),
        (4, "Authentication", "/api/v1/auth/company/register", "POST", "Public", "Form Data: Company info + SECP/NTN/SAP files", "201 Created -> Company Registration Record (Pending)", "Liqae", "Completed"),
        (5, "Authentication", "/api/v1/auth/me", "GET", "Authenticated", "Header: Authorization Bearer", "200 OK -> Current User Profile Object", "Liqae", "Completed"),
        # Student
        (6, "Student Profile", "/api/v1/students/me", "GET", "Student", "Header: Authorization Bearer", "200 OK -> Full Student Profile + Skills + Experience", "Shahryar", "Completed"),
        (7, "Student Profile", "/api/v1/students/me", "PUT", "Student", "JSON: {name, department, gpa, bio, links}", "200 OK -> Updated Student Profile Object", "Shahryar", "Completed"),
        (8, "Student Document", "/api/v1/students/me/resume", "POST", "Student", "Multipart Form: resume_file (PDF/DOCX)", "200 OK -> {resume_url, filename}", "Shahryar", "Completed"),
        (9, "Student Document", "/api/v1/students/me/resume", "DELETE", "Student", "Header: Authorization Bearer", "200 OK -> {message: Resume deleted}", "Shahryar", "Completed"),
        (10, "Student Avatar", "/api/v1/students/me/photo", "POST", "Student", "Multipart Form: photo_file (PNG/JPG)", "200 OK -> {photo_url}", "Shahryar", "Completed"),
        (11, "Student Skills", "/api/v1/students/me/skills", "GET", "Student", "Header: Authorization Bearer", "200 OK -> Array of [{skill_name, proficiency_percent}]", "Shahryar", "Completed"),
        (12, "Student Skills", "/api/v1/students/me/skills", "POST", "Student", "JSON: {skill_name, proficiency_percent}", "201 Created -> Skill Record", "Shahryar", "Completed"),
        (13, "Student Experience", "/api/v1/students/me/experiences", "POST", "Student", "JSON: {company_name, title, start_date, end_date}", "201 Created -> Experience Record", "Shahryar", "Completed"),
        (14, "Student Certs", "/api/v1/students/me/certifications", "POST", "Student", "JSON: {name, issuer, issue_date, url}", "201 Created -> Certification Record", "Shahryar", "Completed"),
        (15, "Student Jobs Search", "/api/v1/students/jobs", "GET", "Student", "Query: ?search=keyword&type=full_time", "200 OK -> List of Published Job Postings", "Shahryar", "Completed"),
        (16, "Student Jobs Detail", "/api/v1/students/jobs/{job_id}", "GET", "Student", "Path: job_id", "200 OK -> Detailed Job Posting Specification", "Shahryar", "Completed"),
        (17, "Student Apply", "/api/v1/students/jobs/{job_id}/apply", "POST", "Student", "JSON: {cover_letter, custom_resume_url}", "201 Created -> Application Record (Status: applied)", "Shahryar", "Completed"),
        (18, "Student Applications", "/api/v1/students/me/applications", "GET", "Student", "Header: Authorization Bearer", "200 OK -> List of Submitted Applications with status", "Shahryar", "Completed"),
        (19, "Student Withdraw", "/api/v1/students/me/applications/{id}/withdraw", "POST", "Student", "Path: application_id", "200 OK -> {status: withdrawn}", "Shahryar", "Completed"),
        (20, "Student Interviews", "/api/v1/students/me/interview-requests", "GET", "Student", "Header: Authorization Bearer", "200 OK -> List of Received Interview Slots", "Liqae", "Completed"),
        (21, "Student Interviews", "/api/v1/students/me/interview-requests/{id}/accept", "POST", "Student", "Path: request_id", "200 OK -> {status: accepted}", "Liqae", "Completed"),
        (22, "Student Interviews", "/api/v1/students/me/interview-requests/{id}/decline", "POST", "Student", "Path: request_id", "200 OK -> {status: declined}", "Liqae", "Completed"),
        # Company
        (23, "Company Profile", "/api/v1/company/profile", "GET", "Approved Company", "Header: Authorization Bearer", "200 OK -> Company Corporate Profile & Verification Data", "Liqae", "Completed"),
        (24, "Company Profile", "/api/v1/company/profile", "PATCH", "Approved Company", "JSON: {company_name, website, location, bio}", "200 OK -> Updated Company Profile Object", "Liqae", "Completed"),
        (25, "Company Jobs", "/api/v1/company/jobs", "POST", "Approved Company", "JSON: {title, description, min_cgpa, employment_type}", "201 Created -> Job Record", "Liqae", "Completed"),
        (26, "Company Jobs", "/api/v1/company/jobs", "GET", "Approved Company", "Header: Authorization Bearer", "200 OK -> List of Jobs posted by company", "Liqae", "Completed"),
        (27, "Company Jobs Status", "/api/v1/company/jobs/{job_id}/status", "PATCH", "Approved Company", "JSON: {status: draft|published|closed}", "200 OK -> Updated Job Status Object", "Liqae", "Completed"),
        (28, "Company Applicants", "/api/v1/company/jobs/{job_id}/applications", "GET", "Approved Company", "Path: job_id", "200 OK -> Applicant List with resumes & GPAs", "Liqae", "Completed"),
        (29, "Company Shortlist", "/api/v1/company/applications/{id}/shortlist", "POST", "Approved Company", "Path: application_id", "200 OK -> Application Status: shortlisted", "Liqae", "Completed"),
        (30, "Company Interview", "/api/v1/company/applications/{id}/interview-request", "POST", "Approved Company", "JSON: {interview_date, message}", "201 Created -> Interview Request Object", "Liqae", "Completed"),
        (31, "Company Talent Search", "/api/v1/company/candidates/search", "GET", "Approved Company", "Query: ?skill=Python&department=CS", "200 OK -> Student Marketplace Talent Profiles", "Shahryar", "Completed"),
        # Admin & Super Admin
        (32, "Admin Companies", "/api/v1/admin/companies", "GET", "Admin / Super Admin", "Query: ?status=pending", "200 OK -> Company Verification Requests", "Shahryar", "Completed"),
        (33, "Admin Approve", "/api/v1/admin/companies/{id}/approve", "POST", "Admin / Super Admin", "Path: company_id", "200 OK -> Company Status: approved", "Shahryar", "Completed"),
        (34, "Admin Reject", "/api/v1/admin/companies/{id}/reject", "POST", "Admin / Super Admin", "JSON: {rejection_reason}", "200 OK -> Company Status: rejected", "Shahryar", "Completed"),
        (35, "Super Admin", "/api/v1/super-admin/admins", "POST", "Super Admin", "JSON: {name, email, password}", "201 Created -> New Admin Account", "Shahryar", "Completed")
    ]

    for r_idx, row in enumerate(api_specs, start=4):
        ws5.row_dimensions[r_idx].height = 24
        for c_idx, val in enumerate(row, start=1):
            cell = ws5.cell(row=r_idx, column=c_idx, value=val)
            cell.border = thin_border
            cell.font = font_regular
            if c_idx == 1:
                cell.alignment = Alignment(horizontal="center", vertical="center")
            elif c_idx == 4:
                cell.alignment = Alignment(horizontal="center", vertical="center")
            elif c_idx == 8:
                cell.font = font_bold
                cell.alignment = Alignment(horizontal="center", vertical="center")
            elif c_idx == 9 and val == "Completed":
                cell.fill = status_done_fill
                cell.font = status_done_font
                cell.alignment = Alignment(horizontal="center", vertical="center")
            else:
                cell.alignment = Alignment(vertical="center", wrap_text=True)

    autofit_sheet_columns(ws5, 9)

    # =============================================================
    # TAB 6: Frontend_Interface_Matrix
    # =============================================================
    ws6 = wb.create_sheet(title="Frontend_Interface_Matrix")
    style_title_banner(ws6, "Frontend Application Interfaces & Shared Component Matrix", 8)

    headers_fe = ["Task Id", "Interface Title", "URL Path / File Name", "Resource Script", "Target User Role", "Interface Responsibilities & Features", "Lead Engineer", "Status"]
    style_table_headers(ws6, 3, headers_fe)

    fe_matrix = [
        (1, "Public Job Landing Page", "/index.html", "landing.js", "Public Visitor", "Hero job search banner, public job cards grid, filter by employment type, auth quick links", "Liqae", "Completed"),
        (2, "Unified Auth Login Page", "/login.html", "login.js", "All Roles", "Role-aware login form, JWT session persistence, LMS institutional login modal", "Liqae", "Completed"),
        (3, "Company Onboarding Registration", "/register-company.html", "register-company.js", "Public Company", "Multi-step corporate registration, SECP/NTN/SAP number inputs, file dropzone", "Liqae", "Completed"),
        (4, "Student Marketplace Dashboard", "dashboards/student-dashboard.html", "student-dashboard.js", "Student", "Profile manager, resume drag & drop, skill percentage sliders, job application history", "Shahryar", "Completed"),
        (5, "Company Recruitment Dashboard", "dashboards/company-dashboard.html", "company-dashboard.js", "Company", "Job creation modal, candidate search engine, application review drawer, interview scheduler", "Liqae", "Completed"),
        (6, "Admin Verification Dashboard", "dashboards/admin-dashboard.html", "admin-dashboard.js", "Admin", "Pending company approval queue, SECP document viewer modal, user moderation controls", "Shahryar", "Completed"),
        (7, "Super Admin Portal Dashboard", "dashboards/super-admin-dashboard.html", "super-admin-dashboard.js", "Super Admin", "Admin user creation form, platform activity metrics, global security configuration", "Shahryar", "Completed"),
        (8, "Shared API Engine", "frontend/js/api.js", "api.js", "Frontend Shared", "Central HTTP client with automatic Bearer token injection, error handling, JSON serialization", "Liqae", "Completed"),
        (9, "Session & Auth Guard Utility", "frontend/js/auth.js", "auth.js", "Frontend Shared", "Validates JWT expiration, redirects unauthorized users to login, role-based dashboard router", "Liqae", "Completed")
    ]

    for r_idx, row in enumerate(fe_matrix, start=4):
        ws6.row_dimensions[r_idx].height = 26
        for c_idx, val in enumerate(row, start=1):
            cell = ws6.cell(row=r_idx, column=c_idx, value=val)
            cell.border = thin_border
            cell.font = font_regular
            if c_idx == 1:
                cell.alignment = Alignment(horizontal="center", vertical="center")
            elif c_idx == 7:
                cell.font = font_bold
                cell.alignment = Alignment(horizontal="center", vertical="center")
            elif c_idx == 8 and val == "Completed":
                cell.fill = status_done_fill
                cell.font = status_done_font
                cell.alignment = Alignment(horizontal="center", vertical="center")
            else:
                cell.alignment = Alignment(vertical="center", wrap_text=True)

    autofit_sheet_columns(ws6, 8)

    # =============================================================
    # TAB 7: Database_Schema_Dictionary
    # =============================================================
    ws7 = wb.create_sheet(title="Database_Schema_Dictionary")
    style_title_banner(ws7, "Comprehensive Database Schema & Data Dictionary (job_portal)", 9)

    headers_db = ["Sr #", "Table Name", "Column Name", "Data Type", "Nullable", "Key Type", "Foreign Key Target", "Default Value", "Column Description & Business Rules"]
    style_table_headers(ws7, 3, headers_db)

    db_dictionary = [
        # users
        (1, "users", "id", "BIGINT", "NO", "PK", "-", "AUTO_INCREMENT", "Unique 64-bit auto-increment user ID"),
        (2, "users", "email", "VARCHAR(255)", "NO", "UK", "-", "-", "Unique login email address"),
        (3, "users", "password_hash", "VARCHAR(255)", "YES", "-", "-", "NULL", "Bcrypt password hash string"),
        (4, "users", "role", "ENUM", "NO", "-", "-", "-", "Role: super_admin, admin, company, student"),
        (5, "users", "auth_provider", "ENUM", "NO", "-", "-", "'local'", "Authentication provider: local or lms"),
        (6, "users", "status", "ENUM", "NO", "-", "-", "'active'", "Account status: active, disabled, deleted"),
        # companies
        (7, "companies", "id", "BIGINT", "NO", "PK", "-", "AUTO_INCREMENT", "Unique corporate company ID"),
        (8, "companies", "user_id", "BIGINT", "NO", "FK / UK", "users.id", "-", "1:1 mapping to parent user account"),
        (9, "companies", "company_name", "VARCHAR(255)", "NO", "-", "-", "-", "Registered business name"),
        (10, "companies", "secp_number", "VARCHAR(100)", "YES", "-", "-", "NULL", "SECP Corporate Registration Number"),
        (11, "companies", "sap_number", "VARCHAR(100)", "YES", "-", "-", "NULL", "SAP System Integration Number"),
        (12, "companies", "ntn_number", "VARCHAR(100)", "YES", "-", "-", "NULL", "National Tax Number (NTN)"),
        (13, "companies", "status", "ENUM", "NO", "-", "-", "'pending'", "Corporate status: pending, approved, rejected, disabled"),
        # student_profiles
        (14, "student_profiles", "id", "BIGINT", "NO", "PK", "-", "AUTO_INCREMENT", "Unique student profile ID"),
        (15, "student_profiles", "user_id", "BIGINT", "NO", "FK / UK", "users.id", "-", "1:1 mapping to student user account"),
        (16, "student_profiles", "roll_no", "VARCHAR(50)", "NO", "UK", "-", "-", "University student roll number"),
        (17, "student_profiles", "department", "VARCHAR(100)", "NO", "-", "-", "-", "Academic department (e.g. CS, EE, ME)"),
        (18, "student_profiles", "gpa", "DECIMAL(3,2)", "YES", "-", "-", "NULL", "Cumulative GPA out of 4.00"),
        (19, "student_profiles", "resume_path", "VARCHAR(500)", "YES", "-", "-", "NULL", "Storage file path to uploaded resume"),
        (20, "student_profiles", "photo_path", "VARCHAR(500)", "YES", "-", "-", "NULL", "Storage file path to avatar image"),
        # jobs
        (21, "jobs", "id", "BIGINT", "NO", "PK", "-", "AUTO_INCREMENT", "Unique job posting ID"),
        (22, "jobs", "company_id", "BIGINT", "NO", "FK", "companies.id", "-", "Foreign key linking job to company"),
        (23, "jobs", "title", "VARCHAR(255)", "NO", "-", "-", "-", "Job vacancy title"),
        (24, "jobs", "employment_type", "ENUM", "NO", "-", "-", "'full_time'", "full_time, part_time, internship, contract, remote"),
        (25, "jobs", "min_cgpa", "DECIMAL(4,2)", "YES", "-", "-", "NULL", "Minimum CGPA required to apply"),
        (26, "jobs", "status", "ENUM", "NO", "-", "-", "'draft'", "Job status: draft, published, closed, hidden"),
        # applications
        (27, "applications", "id", "BIGINT", "NO", "PK", "-", "AUTO_INCREMENT", "Unique job application record ID"),
        (28, "applications", "job_id", "BIGINT", "NO", "FK", "jobs.id", "-", "Target job posting link"),
        (29, "applications", "student_profile_id", "BIGINT", "NO", "FK", "student_profiles.id", "-", "Applicant student profile link"),
        (30, "applications", "status", "ENUM", "NO", "-", "-", "'applied'", "applied, shortlisted, interviewed, rejected, withdrawn"),
        # interview_requests
        (31, "interview_requests", "id", "BIGINT", "NO", "PK", "-", "AUTO_INCREMENT", "Unique interview request ID"),
        (32, "interview_requests", "application_id", "BIGINT", "NO", "FK / UK", "applications.id", "-", "1:1 link to job application"),
        (33, "interview_requests", "interview_date", "DATETIME", "YES", "-", "-", "NULL", "Scheduled interview slot timestamp"),
        (34, "interview_requests", "status", "ENUM", "NO", "-", "-", "'pending'", "pending, accepted, declined, cancelled"),
        # notifications
        (35, "notifications", "id", "BIGINT", "NO", "PK", "-", "AUTO_INCREMENT", "Unique notification alert ID"),
        (36, "notifications", "user_id", "BIGINT", "NO", "FK", "users.id", "-", "Recipient user account ID"),
        (37, "notifications", "message", "TEXT", "NO", "-", "-", "-", "Notification message text content"),
        (38, "notifications", "is_read", "BOOLEAN", "NO", "INDEX", "-", "FALSE", "Read flag (indexed for fast unread counts)")
    ]

    for r_idx, row in enumerate(db_dictionary, start=4):
        ws7.row_dimensions[r_idx].height = 22
        for c_idx, val in enumerate(row, start=1):
            cell = ws7.cell(row=r_idx, column=c_idx, value=val)
            cell.border = thin_border
            cell.font = font_regular
            if c_idx in [1, 5, 6]:
                cell.alignment = Alignment(horizontal="center", vertical="center")
                if c_idx == 6 and val in ["PK", "FK / UK", "UK"]:
                    cell.font = font_bold
            else:
                cell.alignment = Alignment(vertical="center", wrap_text=True)

    autofit_sheet_columns(ws7, 9)

    # Save output file
    output_path = "documentation/CareerConnect_Project_Planning_Master_Report.xlsx"
    wb.save(output_path)
    print(f"Ultra-premium Excel report generated at: {output_path}")

if __name__ == "__main__":
    create_ultra_premium_excel_report()

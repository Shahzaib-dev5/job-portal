CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NULL,
    name VARCHAR(255) NULL,
    role ENUM('super_admin', 'admin', 'company', 'student') NOT NULL,
    auth_provider ENUM('local', 'lms') NOT NULL DEFAULT 'local',
    status ENUM('active', 'disabled', 'deleted') NOT NULL DEFAULT 'active',
    created_by BIGINT NULL,
    last_login_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_created_by FOREIGN KEY (created_by) REFERENCES users(id)
);

-- If you already created the users table without the name column, run:
-- ALTER TABLE users ADD COLUMN name VARCHAR(255) NULL AFTER password_hash;

CREATE TABLE IF NOT EXISTS companies (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    company_name VARCHAR(255) NOT NULL,
    website VARCHAR(255) NULL,
    industry VARCHAR(100) NULL,
    description TEXT NULL,
    logo_path VARCHAR(500) NULL,
    contact_email VARCHAR(255) NULL,
    contact_phone VARCHAR(50) NULL,
    location VARCHAR(255) NULL,
    secp_number VARCHAR(100) NULL,
    sap_number VARCHAR(100) NULL,
    ntn_number VARCHAR(100) NULL,
    secp_document_path VARCHAR(500) NULL,
    sap_document_path VARCHAR(500) NULL,
    ntn_document_path VARCHAR(500) NULL,
    status ENUM('pending', 'approved', 'rejected', 'disabled', 'deleted') NOT NULL DEFAULT 'pending',
    approved_by BIGINT NULL,
    approved_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_companies_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_companies_approved_by FOREIGN KEY (approved_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS student_profiles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    lms_id VARCHAR(100) NULL,
    roll_no VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    department VARCHAR(100) NOT NULL,
    semester VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    bio TEXT NULL,
    resume_path VARCHAR(500) NULL,
    photo_path VARCHAR(500) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_student_profiles_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS jobs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    company_id BIGINT NOT NULL,
    posted_by BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT NULL,
    location VARCHAR(255) NULL,
    employment_type ENUM('full_time', 'part_time', 'internship', 'contract', 'remote') NOT NULL DEFAULT 'full_time',
    min_cgpa DECIMAL(4,2) NULL,
    salary_min DECIMAL(12,2) NULL,
    salary_max DECIMAL(12,2) NULL,
    application_deadline DATE NULL,
    status ENUM('draft', 'published', 'closed', 'hidden', 'deleted') NOT NULL DEFAULT 'draft',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_jobs_company FOREIGN KEY (company_id) REFERENCES companies(id),
    CONSTRAINT fk_jobs_user FOREIGN KEY (posted_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS applications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    job_id BIGINT NOT NULL,
    student_profile_id BIGINT NOT NULL,
    cover_letter TEXT NULL,
    resume_path VARCHAR(500) NULL,
    status ENUM('applied', 'shortlisted', 'interviewed', 'rejected', 'withdrawn') NOT NULL DEFAULT 'applied',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_applications_job FOREIGN KEY (job_id) REFERENCES jobs(id),
    CONSTRAINT fk_applications_student FOREIGN KEY (student_profile_id) REFERENCES student_profiles(id)
);

CREATE TABLE IF NOT EXISTS student_skills (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_profile_id BIGINT NOT NULL,
    skill_name VARCHAR(100) NOT NULL,
    proficiency ENUM('beginner', 'intermediate', 'advanced', 'expert') NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_student_skills_profile FOREIGN KEY (student_profile_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
    UNIQUE KEY uk_student_skill (student_profile_id, skill_name)
);

CREATE TABLE IF NOT EXISTS student_experiences (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_profile_id BIGINT NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NULL,
    description TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_student_experiences_profile FOREIGN KEY (student_profile_id) REFERENCES student_profiles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS student_certifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_profile_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    issuer VARCHAR(255) NULL,
    issue_date DATE NULL,
    expiry_date DATE NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_student_certifications_profile FOREIGN KEY (student_profile_id) REFERENCES student_profiles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS student_soft_skills (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_profile_id BIGINT NOT NULL,
    skill_name VARCHAR(100) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_student_soft_skills_profile FOREIGN KEY (student_profile_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
    UNIQUE KEY uk_student_soft_skill (student_profile_id, skill_name)
);

CREATE TABLE IF NOT EXISTS student_achievements (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_profile_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    date DATE NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_student_achievements_profile FOREIGN KEY (student_profile_id) REFERENCES student_profiles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS job_skills (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    job_id BIGINT NOT NULL,
    skill_name VARCHAR(100) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_job_skills_job FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    UNIQUE KEY uk_job_skill (job_id, skill_name)
);

CREATE TABLE IF NOT EXISTS interview_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    company_id BIGINT NOT NULL,
    job_id BIGINT NOT NULL,
    student_profile_id BIGINT NOT NULL,
    application_id BIGINT NOT NULL UNIQUE,
    message TEXT NULL,
    interview_date DATETIME NULL,
    status ENUM('pending', 'accepted', 'declined', 'cancelled') NOT NULL DEFAULT 'pending',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    responded_at DATETIME NULL,
    CONSTRAINT fk_interviews_company FOREIGN KEY (company_id) REFERENCES companies(id),
    CONSTRAINT fk_interviews_job FOREIGN KEY (job_id) REFERENCES jobs(id),
    CONSTRAINT fk_interviews_student FOREIGN KEY (student_profile_id) REFERENCES student_profiles(id),
    CONSTRAINT fk_interviews_application FOREIGN KEY (application_id) REFERENCES applications(id)
);

CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    link VARCHAR(500) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notifications_user_read (user_id, is_read)
);

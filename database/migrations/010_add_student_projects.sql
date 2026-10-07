-- Add categorized projects to student profiles.
-- Run this once against the live job_portal database before using the Projects section.

CREATE TABLE IF NOT EXISTS student_projects (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    student_profile_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'Other',
    description TEXT NULL,
    technologies VARCHAR(500) NULL,
    project_url VARCHAR(500) NULL,
    start_date DATE NULL,
    end_date DATE NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_student_projects_profile (student_profile_id),
    CONSTRAINT fk_student_projects_profile
        FOREIGN KEY (student_profile_id) REFERENCES student_profiles(id)
        ON DELETE CASCADE
);

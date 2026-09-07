-- Keep the existing job_skills table aligned with the ORM model.
ALTER TABLE job_skills
    ADD COLUMN created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER skill_name;

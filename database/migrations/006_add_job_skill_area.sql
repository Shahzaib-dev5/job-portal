ALTER TABLE job_skills
    ADD COLUMN skill_area VARCHAR(100) NOT NULL DEFAULT 'Other' AFTER job_id;
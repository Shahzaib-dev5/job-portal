ALTER TABLE student_profiles
    ADD COLUMN resume_text TEXT NULL AFTER bio;

ALTER TABLE student_skills
    ADD COLUMN proficiency_percent INT NULL AFTER proficiency,
    ADD COLUMN skill_area VARCHAR(100) NULL AFTER student_profile_id;

ALTER TABLE student_soft_skills
    ADD COLUMN skill_area VARCHAR(100) NULL AFTER student_profile_id,
    ADD COLUMN proficiency_percent INT NULL AFTER skill_name;

ALTER TABLE student_certifications
    ADD COLUMN credential_url VARCHAR(500) NULL AFTER issuer;

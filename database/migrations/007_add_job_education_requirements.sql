-- Add the academic targeting fields used by the company job-post form.
-- Run once against an existing job_portal database.
ALTER TABLE jobs
    ADD COLUMN required_degree VARCHAR(150) NULL AFTER requirements,
    ADD COLUMN required_area VARCHAR(150) NULL AFTER required_degree;

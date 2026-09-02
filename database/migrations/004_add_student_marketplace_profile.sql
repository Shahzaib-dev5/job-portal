ALTER TABLE student_profiles
    ADD COLUMN professional_title VARCHAR(255) NULL AFTER email,
    ADD COLUMN location VARCHAR(255) NULL AFTER professional_title,
    ADD COLUMN hourly_rate DECIMAL(10,2) NULL AFTER location,
    ADD COLUMN availability VARCHAR(50) NULL AFTER hourly_rate,
    ADD COLUMN languages VARCHAR(500) NULL AFTER availability,
    ADD COLUMN portfolio_url VARCHAR(500) NULL AFTER languages,
    ADD COLUMN github_url VARCHAR(500) NULL AFTER portfolio_url,
    ADD COLUMN linkedin_url VARCHAR(500) NULL AFTER github_url;

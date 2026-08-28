-- =============================================
-- Seed Data for Job Portal
-- =============================================

-- Note: Password hashes are for 'admin123' (bcrypt with 12 rounds)
-- You can generate new hashes using: 
-- python -c "from app.core.security import get_password_hash; print(get_password_hash('your_password'))"

-- =============================================
-- 1. SUPER ADMIN
-- =============================================
INSERT INTO users (email, password_hash, name, role, auth_provider, status) 
VALUES (
    'superadmin@jobportal.com',
    '$2b$12$OlI8upsQshxNfrbE3G.roO6m0/uwfCjB8gnJ4E8bCAqgNTRnw/1ya',
    'Super Admin',
    'super_admin',
    'local',
    'active'
);

-- Get the super admin ID for later use
SET @super_admin_id = (SELECT id FROM users WHERE email = 'superadmin@jobportal.com');

-- =============================================
-- 2. ADMIN USERS
-- =============================================
INSERT INTO users (email, password_hash, name, role, auth_provider, status, created_by) 
VALUES 
    (
        'admin@jobportal.com',
        '$2b$12$OlI8upsQshxNfrbE3G.roO6m0/uwfCjB8gnJ4E8bCAqgNTRnw/1ya',
        'System Admin',
        'admin',
        'local',
        'active',
        @super_admin_id
    ),
    (
        'hr@company.com',
        '$2b$12$OlI8upsQshxNfrbE3G.roO6m0/uwfCjB8gnJ4E8bCAqgNTRnw/1ya',
        'HR Manager',
        'admin',
        'local',
        'active',
        @super_admin_id
    );

-- =============================================
-- 3. COMPANY USERS (with company profiles)
-- =============================================
-- Company 1: Tech Corp (Approved)
INSERT INTO users (email, password_hash, name, role, auth_provider, status) 
VALUES (
    'company@techcorp.com',
    '$2b$12$OlI8upsQshxNfrbE3G.roO6m0/uwfCjB8gnJ4E8bCAqgNTRnw/1ya',
    'Tech Corp',
    'company',
    'local',
    'active'
);

SET @tech_corp_user_id = (SELECT id FROM users WHERE email = 'company@techcorp.com');
SET @admin_id = (SELECT id FROM users WHERE email = 'admin@jobportal.com');

INSERT INTO companies (
    user_id, 
    company_name, 
    website, 
    industry, 
    description, 
    contact_email, 
    contact_phone, 
    location, 
    status,
    approved_by,
    approved_at
) VALUES (
    @tech_corp_user_id,
    'Tech Corp',
    'https://techcorp.com',
    'Technology',
    'Leading technology company specializing in AI and cloud solutions.',
    'hr@techcorp.com',
    '+1-555-123-4567',
    'San Francisco, CA',
    'approved',
    @admin_id,
    NOW()
);

-- Company 2: Green Energy Ltd (Approved)
INSERT INTO users (email, password_hash, name, role, auth_provider, status) 
VALUES (
    'company@greenenergy.com',
    '$2b$12$OlI8upsQshxNfrbE3G.roO6m0/uwfCjB8gnJ4E8bCAqgNTRnw/1ya',
    'Green Energy',
    'company',
    'local',
    'active'
);

SET @green_energy_user_id = (SELECT id FROM users WHERE email = 'company@greenenergy.com');

INSERT INTO companies (
    user_id, 
    company_name, 
    website, 
    industry, 
    description, 
    contact_email, 
    contact_phone, 
    location, 
    status,
    approved_by,
    approved_at
) VALUES (
    @green_energy_user_id,
    'Green Energy Ltd',
    'https://greenenergy.com',
    'Renewable Energy',
    'Leading provider of sustainable energy solutions.',
    'hr@greenenergy.com',
    '+1-555-987-6543',
    'Austin, TX',
    'approved',
    @admin_id,
    NOW()
);

-- Company 3: Startup IO (Pending Approval)
INSERT INTO users (email, password_hash, name, role, auth_provider, status) 
VALUES (
    'company@startup.io',
    '$2b$12$OlI8upsQshxNfrbE3G.roO6m0/uwfCjB8gnJ4E8bCAqgNTRnw/1ya',
    'Startup IO',
    'company',
    'local',
    'active'
);

SET @startup_user_id = (SELECT id FROM users WHERE email = 'company@startup.io');

INSERT INTO companies (
    user_id, 
    company_name, 
    website, 
    industry, 
    description, 
    contact_email, 
    contact_phone, 
    location, 
    status
) VALUES (
    @startup_user_id,
    'Startup IO',
    'https://startup.io',
    'Software',
    'Innovative startup building next-gen solutions.',
    'hr@startup.io',
    '+1-555-111-2222',
    'Boston, MA',
    'pending'
);

-- =============================================
-- 4. STUDENT USERS (LMS-based)
-- =============================================
-- Student 1
INSERT INTO users (email, name, role, auth_provider, status) 
VALUES (
    'student1@university.edu',
    'Alice Johnson',
    'student',
    'lms',
    'active'
);

SET @student1_id = (SELECT id FROM users WHERE email = 'student1@university.edu');

INSERT INTO student_profiles (
    user_id,
    lms_id,
    roll_no,
    name,
    department,
    semester,
    email,
    bio
) VALUES (
    @student1_id,
    'LMS1001',
    'CS2023001',
    'Alice Johnson',
    'Computer Science',
    '6',
    'student1@university.edu',
    'Passionate about AI and machine learning. Looking for internship opportunities.'
);

-- Student 2
INSERT INTO users (email, name, role, auth_provider, status) 
VALUES (
    'student2@university.edu',
    'Bob Smith',
    'student',
    'lms',
    'active'
);

SET @student2_id = (SELECT id FROM users WHERE email = 'student2@university.edu');

INSERT INTO student_profiles (
    user_id,
    lms_id,
    roll_no,
    name,
    department,
    semester,
    email,
    bio
) VALUES (
    @student2_id,
    'LMS1002',
    'EE2023002',
    'Bob Smith',
    'Electrical Engineering',
    '4',
    'student2@university.edu',
    'Interested in embedded systems and IoT.'
);

-- Student 3
INSERT INTO users (email, name, role, auth_provider, status) 
VALUES (
    'student3@university.edu',
    'Carol Davis',
    'student',
    'lms',
    'active'
);

SET @student3_id = (SELECT id FROM users WHERE email = 'student3@university.edu');

INSERT INTO student_profiles (
    user_id,
    lms_id,
    roll_no,
    name,
    department,
    semester,
    email,
    bio
) VALUES (
    @student3_id,
    'LMS1003',
    'BA2023003',
    'Carol Davis',
    'Business Administration',
    '6',
    'student3@university.edu',
    'Marketing and business strategy enthusiast.'
);

-- =============================================
-- 5. LOCAL STUDENT (for testing without LMS)
-- =============================================
INSERT INTO users (email, password_hash, name, role, auth_provider, status) 
VALUES (
    'teststudent@example.com',
    '$2b$12$OlI8upsQshxNfrbE3G.roO6m0/uwfCjB8gnJ4E8bCAqgNTRnw/1ya',
    'Test Student',
    'student',
    'local',
    'active'
);

SET @test_student_id = (SELECT id FROM users WHERE email = 'teststudent@example.com');

INSERT INTO student_profiles (
    user_id,
    lms_id,
    roll_no,
    name,
    department,
    semester,
    email
) VALUES (
    @test_student_id,
    'LOCAL001',
    'TEST2024001',
    'Test Student',
    'Computer Science',
    '4',
    'teststudent@example.com'
);

-- =============================================
-- 6. SAMPLE JOB POSTINGS
-- =============================================
-- Job 1: Software Engineer Intern
INSERT INTO jobs (
    company_id,
    posted_by,
    title,
    description,
    requirements,
    location,
    employment_type,
    salary_min,
    salary_max,
    application_deadline,
    status
) VALUES (
    (SELECT id FROM companies WHERE company_name = 'Tech Corp'),
    (SELECT id FROM users WHERE email = 'company@techcorp.com'),
    'Software Engineer Intern',
    'We are looking for a motivated software engineering intern to join our team. You will work on real-world projects and learn from experienced engineers.',
    'Currently enrolled in CS/SE program. Knowledge of Python, JavaScript, and web development. Strong problem-solving skills.',
    'San Francisco, CA (Remote)',
    'internship',
    1500.00,
    2500.00,
    DATE_ADD(CURDATE(), INTERVAL 30 DAY),
    'published'
);

SET @job1_id = (SELECT id FROM jobs WHERE title = 'Software Engineer Intern');

-- Job 2: Full Stack Developer
INSERT INTO jobs (
    company_id,
    posted_by,
    title,
    description,
    requirements,
    location,
    employment_type,
    salary_min,
    salary_max,
    application_deadline,
    status
) VALUES (
    (SELECT id FROM companies WHERE company_name = 'Tech Corp'),
    (SELECT id FROM users WHERE email = 'company@techcorp.com'),
    'Full Stack Developer',
    'Join our team as a Full Stack Developer. You will build and maintain web applications using modern technologies.',
    '3+ years experience with React, Node.js, and PostgreSQL. Knowledge of AWS is a plus.',
    'San Francisco, CA',
    'full_time',
    80000.00,
    120000.00,
    DATE_ADD(CURDATE(), INTERVAL 45 DAY),
    'published'
);

SET @job2_id = (SELECT id FROM jobs WHERE title = 'Full Stack Developer');

-- Job 3: Renewable Energy Engineer
INSERT INTO jobs (
    company_id,
    posted_by,
    title,
    description,
    requirements,
    location,
    employment_type,
    salary_min,
    salary_max,
    application_deadline,
    status
) VALUES (
    (SELECT id FROM companies WHERE company_name = 'Green Energy Ltd'),
    (SELECT id FROM users WHERE email = 'company@greenenergy.com'),
    'Renewable Energy Engineer',
    'Design and implement renewable energy systems. Work on solar, wind, and sustainable energy projects.',
    'Degree in Electrical or Mechanical Engineering. Knowledge of renewable energy systems.',
    'Austin, TX',
    'full_time',
    75000.00,
    110000.00,
    DATE_ADD(CURDATE(), INTERVAL 60 DAY),
    'published'
);

SET @job3_id = (SELECT id FROM jobs WHERE title = 'Renewable Energy Engineer');

-- =============================================
-- 7. SAMPLE JOB SKILLS
-- =============================================
INSERT INTO job_skills (job_id, skill_name) VALUES
    (@job1_id, 'Python'),
    (@job1_id, 'JavaScript'),
    (@job1_id, 'React'),
    (@job2_id, 'React'),
    (@job2_id, 'Node.js'),
    (@job2_id, 'PostgreSQL');

-- =============================================
-- 8. SAMPLE STUDENT SKILLS
-- =============================================
SET @student_profile_id = (SELECT id FROM student_profiles WHERE roll_no = 'CS2023001');

INSERT INTO student_skills (student_profile_id, skill_name, proficiency) VALUES
    (@student_profile_id, 'Python', 'advanced'),
    (@student_profile_id, 'JavaScript', 'intermediate'),
    (@student_profile_id, 'React', 'beginner'),
    (@student_profile_id, 'Java', 'intermediate');

-- =============================================
-- 9. SAMPLE STUDENT EXPERIENCES
-- =============================================
INSERT INTO student_experiences (student_profile_id, company_name, title, start_date, end_date, description) VALUES
    (
        @student_profile_id,
        'Freelance',
        'Web Developer',
        '2025-01-01',
        '2025-06-30',
        'Built websites for small businesses using React and Node.js. Implemented responsive designs and REST APIs.'
    ),
    (
        @student_profile_id,
        'University IT Department',
        'Student Assistant',
        '2024-09-01',
        '2024-12-31',
        'Assisted with IT support and maintained university website.'
    );

-- =============================================
-- 10. SAMPLE APPLICATIONS
-- =============================================
INSERT INTO applications (
    job_id,
    student_profile_id,
    cover_letter,
    resume_path,
    status
) VALUES (
    @job1_id,
    @student_profile_id,
    'I am very interested in this internship opportunity. I have experience with Python and web development through my coursework and freelance projects.',
    '/uploads/resumes/resume_alice.pdf',
    'applied'
);

-- =============================================
-- 11. SAMPLE NOTIFICATIONS
-- =============================================
INSERT INTO notifications (user_id, notification_type, message, is_read) VALUES
    (
        (SELECT id FROM users WHERE email = 'company@techcorp.com'),
        'application',
        'Alice Johnson has applied for Software Engineer Intern position.',
        FALSE
    ),
    (
        (SELECT id FROM users WHERE email = 'student1@university.edu'),
        'application_status',
        'Your application for Software Engineer Intern has been received.',
        FALSE
    );

-- =============================================
-- 12. VERIFICATION QUERIES (run these to check)
-- =============================================
SELECT '=== USERS ===' as '';
SELECT id, email, name, role, status FROM users;

SELECT '=== COMPANIES ===' as '';
SELECT id, company_name, status FROM companies;

SELECT '=== STUDENTS ===' as '';
SELECT id, name, roll_no, department FROM student_profiles;

SELECT '=== JOBS ===' as '';
SELECT id, title, status FROM jobs;
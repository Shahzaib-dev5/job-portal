-- Allow admins/career counselors to record hiring and rejection decisions.
ALTER TABLE applications
    MODIFY COLUMN status ENUM('applied', 'shortlisted', 'interviewed', 'hired', 'rejected', 'withdrawn') NOT NULL DEFAULT 'applied',
    ADD COLUMN rejection_reason TEXT NULL,
    ADD COLUMN decision_at DATETIME NULL;

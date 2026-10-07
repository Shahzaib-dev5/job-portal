CREATE TABLE IF NOT EXISTS application_activities (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    application_id BIGINT UNSIGNED NOT NULL,
    actor_user_id BIGINT UNSIGNED NOT NULL,
    action VARCHAR(40) NOT NULL,
    remarks TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_application_activities_application FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
    CONSTRAINT fk_application_activities_actor FOREIGN KEY (actor_user_id) REFERENCES users(id),
    INDEX idx_application_activities_application (application_id)
);

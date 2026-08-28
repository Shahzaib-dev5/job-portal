-- Upgrade existing installations created before users.name was added.
ALTER TABLE users ADD COLUMN name VARCHAR(255) NULL AFTER password_hash;

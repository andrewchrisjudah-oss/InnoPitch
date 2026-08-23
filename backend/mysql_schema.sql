CREATE DATABASE IF NOT EXISTS knomo_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

USE knomo_db;

CREATE TABLE IF NOT EXISTS users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(254) NOT NULL UNIQUE,
    display_name VARCHAR(60) NOT NULL,
    username VARCHAR(24) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    password_salt VARCHAR(255) NOT NULL,
    study_seconds BIGINT UNSIGNED NOT NULL DEFAULT 0,
    current_streak INT UNSIGNED NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP NULL,
    INDEX idx_users_email (email),
    INDEX idx_users_username (username)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS interests (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(60) NOT NULL UNIQUE,
    icon VARCHAR(40) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS user_interests (
    user_id BIGINT UNSIGNED NOT NULL,
    interest_id BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (user_id, interest_id),
    CONSTRAINT fk_user_interests_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_interests_interest FOREIGN KEY (interest_id) REFERENCES interests(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS sessions (
    token VARCHAR(128) PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_sessions_user (user_id),
    INDEX idx_sessions_expiry (expires_at),
    CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS password_resets (
    token VARCHAR(128) PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_resets_user (user_id),
    CONSTRAINT fk_resets_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS study_sessions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    subject VARCHAR(100) NOT NULL,
    duration_seconds INT UNSIGNED NOT NULL,
    studied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_study_user_date (user_id, studied_at),
    CONSTRAINT fk_study_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

INSERT IGNORE INTO interests(name, icon) VALUES
('Biology','dna'),('Chemistry','flask'),('Physics','atom'),
('Mathematics','sigma'),('Computer science','code'),('Astronomy','telescope'),
('Psychology','brain'),('History','landmark'),('Economics','chart'),
('Literature','book'),('Medicine','heart'),('Engineering','wrench');

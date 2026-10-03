-- ============================================================================
-- PRTV SHOW // TERMINALX999 - ENTERPRISE DATABASE SCHEMA
-- MySQL / MariaDB Schema Definition
-- ============================================================================

CREATE DATABASE IF NOT EXISTS `prtv_terminal_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `prtv_terminal_db`;

-- 1. Administrators Table
CREATE TABLE IF NOT EXISTS `admins` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(64) NOT NULL UNIQUE,
  `email` VARCHAR(128) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('root_admin', 'reseller', 'moderator') DEFAULT 'reseller',
  `reseller_quota` INT UNSIGNED DEFAULT 50,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `last_login` DATETIME NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed default Root Admin: admin@prtvshow.online / admin123
INSERT INTO `admins` (`username`, `email`, `password_hash`, `role`, `reseller_quota`)
VALUES ('rohan.dll', 'admin@prtvshow.online', '$2y$10$w095H8kZf4y9m5tQ.z5eEeN5bM0gq7L3A2X3o5lM6u9P7s2e5o1G6', 'root_admin', 999999)
ON DUPLICATE KEY UPDATE `username` = `username`;

-- 2. KeyAuth Licenses Table
CREATE TABLE IF NOT EXISTS `licenses` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `license_key` VARCHAR(64) NOT NULL UNIQUE,
  `app_name` VARCHAR(64) NOT NULL DEFAULT 'TERMINALX999_x64',
  `assigned_user` VARCHAR(64) NOT NULL DEFAULT 'Unassigned',
  `hwid` VARCHAR(128) DEFAULT 'Unbound',
  `expiry_date` DATE NOT NULL,
  `status` ENUM('active', 'hwid_locked', 'expired', 'banned') DEFAULT 'active',
  `note` VARCHAR(255) DEFAULT '',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_key` (`license_key`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed Sample Licenses
INSERT INTO `licenses` (`license_key`, `app_name`, `assigned_user`, `hwid`, `expiry_date`, `status`, `note`)
VALUES
('PRTV-8F92-41AC-90B2', 'TERMINALX999_x64', 'ViperX', '4A8F-912C-00B4-E9D1', '2026-12-31', 'active', 'VIP Reseller Pass'),
('PRTV-32KA-991L-M08P', 'Cinema_4K_Pass', 'SkyLord99', '88CF-1102-BA54-77E0', '2026-10-15', 'active', 'Monthly Cinema Access'),
('PRTV-77XC-B943-LL90', 'TERMINALX999_x64', 'ShadowFF', 'Unbound', '2026-10-07', 'hwid_locked', 'Awaiting Hardware Lock'),
('PRTV-110A-BBA8-8832', 'CloudVault_VIP', 'GhostByte', '9920-A001-B789-CC21', '2026-09-28', 'expired', '500MB Vault Pass')
ON DUPLICATE KEY UPDATE `license_key` = `license_key`;

-- 3. Media Streams Catalog (Cinema 4K)
CREATE TABLE IF NOT EXISTS `media_streams` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(128) NOT NULL,
  `category` VARCHAR(64) NOT NULL,
  `quality` VARCHAR(32) NOT NULL DEFAULT '4K HDR',
  `stream_url` TEXT NOT NULL,
  `poster_url` TEXT NOT NULL,
  `views_count` INT UNSIGNED DEFAULT 0,
  `status` ENUM('active', 'inactive') DEFAULT 'active',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Cloud Vault Files Table
CREATE TABLE IF NOT EXISTS `cloud_files` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `file_name` VARCHAR(128) NOT NULL,
  `file_size` VARCHAR(32) NOT NULL,
  `download_count` INT UNSIGNED DEFAULT 0,
  `cdn_link` TEXT NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Free Fire Scrims & Tournament Rooms
CREATE TABLE IF NOT EXISTS `scrim_rooms` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `room_name` VARCHAR(128) NOT NULL,
  `match_type` ENUM('1v1', '2v2', '4v4_CS', 'BR_48P') DEFAULT '4v4_CS',
  `prize_pool` VARCHAR(64) DEFAULT '₹1,000',
  `room_id` VARCHAR(32) DEFAULT '',
  `passcode` VARCHAR(32) DEFAULT '',
  `slots_total` TINYINT UNSIGNED DEFAULT 12,
  `slots_booked` TINYINT UNSIGNED DEFAULT 0,
  `status` ENUM('upcoming', 'live', 'completed') DEFAULT 'upcoming',
  `scheduled_at` DATETIME NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Activity & Security Logs
CREATE TABLE IF NOT EXISTS `activity_logs` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `ip_address` VARCHAR(45) NOT NULL,
  `event_desc` VARCHAR(255) NOT NULL,
  `status_code` VARCHAR(32) DEFAULT 'OK',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_ip` (`ip_address`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

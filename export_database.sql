-- CustomWallApp Database Schema
-- Updated version for production deployment

-- Create database
CREATE DATABASE IF NOT EXISTS memorywall;
USE memorywall;

-- Users table
CREATE TABLE `users` (
   `id` int NOT NULL AUTO_INCREMENT,
   `username` varchar(255) NOT NULL,
   `password` varchar(255) NOT NULL,
   `name` varchar(100) NOT NULL DEFAULT '',
   `email` varchar(255) NOT NULL DEFAULT '',
   `country` varchar(100) NOT NULL DEFAULT '',
   `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
   `profile_pic` longtext,
   `role` enum('free','advanced','premium','admin') DEFAULT 'free',
   `email_verified` tinyint(1) DEFAULT '0',
   `email_verification_code` varchar(8) DEFAULT NULL,
   PRIMARY KEY (`id`),
   UNIQUE KEY `username` (`username`)
 ) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Pending users (for email verification)
CREATE TABLE `pending_users` (
   `id` int NOT NULL AUTO_INCREMENT,
   `username` varchar(255) NOT NULL,
   `password` varchar(255) NOT NULL,
   `name` varchar(100) NOT NULL,
   `email` varchar(255) NOT NULL,
   `country` varchar(100) NOT NULL,
   `profile_pic` longtext,
   `code` varchar(8) NOT NULL,
   `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
   PRIMARY KEY (`id`)
 ) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Plans table
CREATE TABLE `plans` (
   `id` int NOT NULL AUTO_INCREMENT,
   `name` varchar(64) NOT NULL,
   `price` decimal(10,2) NOT NULL DEFAULT '0.00',
   `display_order` int DEFAULT '0',
   PRIMARY KEY (`id`)
 ) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Plan features table
CREATE TABLE `plan_features` (
   `id` int NOT NULL AUTO_INCREMENT,
   `plan_id` int NOT NULL,
   `feature_key` varchar(64) DEFAULT NULL,
   `feature_value` varchar(255) DEFAULT NULL,
   `feature_label` varchar(128) DEFAULT NULL,
   `feature_order` int DEFAULT '0',
   PRIMARY KEY (`id`),
   KEY `plan_id` (`plan_id`),
   CONSTRAINT `plan_features_ibfk_1` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`) ON DELETE CASCADE
 ) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- User plans/subscriptions
CREATE TABLE `user_plans` (
   `id` int NOT NULL AUTO_INCREMENT,
   `userid` int NOT NULL,
   `plan_id` int NOT NULL,
   `start_date` date NOT NULL,
   `end_date` date NOT NULL,
   `status` enum('active','expired','cancelled') DEFAULT 'active',
   `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
   PRIMARY KEY (`id`),
   KEY `userid` (`userid`),
   KEY `plan_id` (`plan_id`),
   CONSTRAINT `user_plans_ibfk_1` FOREIGN KEY (`userid`) REFERENCES `users` (`id`) ON DELETE CASCADE,
   CONSTRAINT `user_plans_ibfk_2` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`) ON DELETE CASCADE
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Subscriptions table
CREATE TABLE `subscriptions` (
   `id` int NOT NULL AUTO_INCREMENT,
   `userid` int NOT NULL,
   `plan` varchar(50) NOT NULL,
   `start_date` date DEFAULT NULL,
   `end_date` date DEFAULT NULL,
   `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
   `price` decimal(10,2) DEFAULT '0.00',
   PRIMARY KEY (`id`),
   UNIQUE KEY `userid` (`userid`)
 ) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Drafts table
CREATE TABLE `drafts` (
   `id` int NOT NULL AUTO_INCREMENT,
   `userid` int NOT NULL,
   `name` varchar(255) NOT NULL,
   `data` longtext NOT NULL,
   `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
   `public` tinyint(1) DEFAULT '0',
   `editors` text,
   PRIMARY KEY (`id`)
 ) ENGINE=InnoDB AUTO_INCREMENT=50 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Payments table
CREATE TABLE `payments` (
   `id` int NOT NULL AUTO_INCREMENT,
   `user_id` int NOT NULL,
   `amount` decimal(10,2) NOT NULL,
   `date` date DEFAULT NULL,
   `status` varchar(50) DEFAULT NULL,
   `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
   PRIMARY KEY (`id`)
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Admin flags/reports
CREATE TABLE `admin_flags` (
   `id` int NOT NULL AUTO_INCREMENT,
   `type` enum('user','content','payment') NOT NULL,
   `userid` int DEFAULT NULL,
   `description` text NOT NULL,
   `status` enum('open','resolved','dismissed') DEFAULT 'open',
   `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
   `resolved_at` timestamp NULL DEFAULT NULL,
   PRIMARY KEY (`id`),
   KEY `userid` (`userid`),
   CONSTRAINT `admin_flags_ibfk_1` FOREIGN KEY (`userid`) REFERENCES `users` (`id`) ON DELETE SET NULL
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Flagged content table
CREATE TABLE `flagged_content` (
   `id` int NOT NULL AUTO_INCREMENT,
   `content_type` varchar(50) NOT NULL,
   `content_id` int NOT NULL,
   `reason` varchar(255) NOT NULL,
   `resolved` tinyint(1) DEFAULT '0',
   `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
   PRIMARY KEY (`id`)
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Altars table
CREATE TABLE `altars` (
   `id` int NOT NULL AUTO_INCREMENT,
   `name` varchar(255) NOT NULL,
   `description` text,
   `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
   PRIMARY KEY (`id`)
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- User stickers table (for individual user sticker assignments)
CREATE TABLE `user_stickers` (
   `id` int NOT NULL AUTO_INCREMENT,
   `user_id` int NOT NULL,
   `sticker` varchar(128) NOT NULL,
   PRIMARY KEY (`id`),
   UNIQUE KEY `unique_user_sticker` (`user_id`,`sticker`),
   CONSTRAINT `user_stickers_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
 ) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- User stickers backup table
CREATE TABLE `user_stickers_backup` (
   `id` int NOT NULL DEFAULT '0',
   `user_id` int NOT NULL,
   `sticker` varchar(128) NOT NULL
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Plan stickers table (for plan-based sticker assignments)
CREATE TABLE `plan_stickers` (
   `id` int NOT NULL AUTO_INCREMENT,
   `plan_name` varchar(50) NOT NULL,
   `sticker` varchar(128) NOT NULL,
   PRIMARY KEY (`id`),
   UNIQUE KEY `unique_plan_sticker` (`plan_name`,`sticker`)
 ) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Insert default plans
INSERT INTO plans (name, price, display_order) VALUES
('Free', 0.00, 1),
('Advanced', 9.99, 2),
('Premium', 19.99, 3);

-- Insert admin user (change password in production!)
INSERT INTO users (username, password, name, email, country, role, email_verified) VALUES
('admin', '$2b$10$your_hashed_password_here', 'Admin User', 'admin@customwallapp.com', 'India', 'admin', 1); 
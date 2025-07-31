-- CustomWallApp Database Schema
-- Export this to set up your production database

-- Create database
CREATE DATABASE IF NOT EXISTS memorywall;
USE memorywall;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    is_verified BOOLEAN DEFAULT FALSE,
    verification_code VARCHAR(6),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Pending users (for email verification)
CREATE TABLE IF NOT EXISTS pending_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    verification_code VARCHAR(6) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Plans table
CREATE TABLE IF NOT EXISTS plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    features JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User plans/subscriptions
CREATE TABLE IF NOT EXISTS user_plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userid INT NOT NULL,
    plan_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status ENUM('active', 'expired', 'cancelled') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userid) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE
);

-- Drafts table
CREATE TABLE IF NOT EXISTS drafts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userid INT NOT NULL,
    title VARCHAR(255),
    content JSON NOT NULL,
    is_shared BOOLEAN DEFAULT FALSE,
    shared_with JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userid) REFERENCES users(id) ON DELETE CASCADE
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userid INT NOT NULL,
    plan_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50),
    status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    transaction_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userid) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE
);

-- Admin flags/reports
CREATE TABLE IF NOT EXISTS admin_flags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('user', 'content', 'payment') NOT NULL,
    userid INT,
    description TEXT NOT NULL,
    status ENUM('open', 'resolved', 'dismissed') DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    FOREIGN KEY (userid) REFERENCES users(id) ON DELETE SET NULL
);

-- User stickers table (for individual user sticker assignments)
CREATE TABLE IF NOT EXISTS user_stickers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    sticker VARCHAR(128) NOT NULL,
    UNIQUE KEY unique_user_sticker (user_id, sticker),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Plan stickers table (for plan-based sticker assignments)
CREATE TABLE IF NOT EXISTS plan_stickers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    plan_name VARCHAR(50) NOT NULL,
    sticker VARCHAR(128) NOT NULL,
    UNIQUE KEY unique_plan_sticker (plan_name, sticker)
);

-- Insert default plans
INSERT INTO plans (name, price, features) VALUES
('Free', 0.00, '["Basic wall creation", "Limited stickers", "Community chat"]'),
('Premium', 9.99, '["Unlimited walls", "Premium stickers", "Advanced features", "Priority support"]'),
('Pro', 19.99, '["Everything in Premium", "Custom themes", "Export options", "API access"]');

-- Insert admin user (change password in production!)
INSERT INTO users (username, email, password, role, is_verified) VALUES
('admin', 'admin@customwallapp.com', '$2b$10$your_hashed_password_here', 'admin', TRUE); 
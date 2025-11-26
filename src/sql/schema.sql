-- sql/schema.sql
-- GenZlator-v2 database schema

-- 1. User Table
CREATE TABLE users (
    uid SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    password_text TEXT NOT NULL
);

-- 2. Chat History table
CREATE TABLE chat_history (
    message_id SERIAL PRIMARY KEY,
    message TEXT NOT NULL,
    translation TEXT,
    
    sender_id INT NOT NULL REFERENCES users(uid),
    receiver_id INT NOT NULL REFERENCES users(uid)
);

-- 3. Indexes for performance
CREATE INDEX idx_chat_sender ON chat_history (sender_id);
CREATE INDEX idx_chat_receiver ON chat_history (receiver_id);
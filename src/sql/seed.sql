-- sql/seed.sql
-- Initial test data for GenZlator-v2

-- 1. Create test users
INSERT INTO users (name, password_text) 
VALUES ('alice', 'alice_pass'), ('bob', 'bob_pass');

-- 2. Create test chat history
INSERT INTO chat_history (message, translation, sender_id, receiver_id)
VALUES 
('Hello Bob!', 'Bonjour, Bob!', 1, 2),
('Hey Alice', NULL, 2, 1);
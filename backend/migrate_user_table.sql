-- Migration to add new columns to users table
-- Run this SQL script against your PostgreSQL database

-- Add password column
ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR;

-- Add country column  
ALTER TABLE users ADD COLUMN IF NOT EXISTS country VARCHAR;

-- Add genres column
ALTER TABLE users ADD COLUMN IF NOT EXISTS genres VARCHAR;

-- Update any existing users to have default values
UPDATE users SET password = 'changeme' WHERE password IS NULL;
UPDATE users SET country = 'Unknown' WHERE country IS NULL;
UPDATE users SET genres = 'general' WHERE genres IS NULL;
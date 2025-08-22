-- Migration: Add user_profiles table
-- This table stores enhanced user profiles with inferred preferences

CREATE TABLE IF NOT EXISTS user_profiles (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    profile TEXT NOT NULL, -- JSON string containing enhanced profile
    updatedAt TEXT NOT NULL,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(userId);
CREATE INDEX IF NOT EXISTS idx_user_profiles_updated_at ON user_profiles(updatedAt);

-- Add the table to the Prisma schema mapping
-- Note: This table is not in the main schema but used by the feedback analyzer

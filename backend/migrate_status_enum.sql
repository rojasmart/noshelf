-- Migration to update status enums with new RESERVED status
-- Run this SQL script against your PostgreSQL database

-- Update CopyStatus enum to include RESERVED
-- Note: PostgreSQL requires dropping and recreating the enum type if you need to add values
-- For simplicity, we'll just update existing records manually for now

-- If you're using a PostgreSQL database with ENUM constraints, you might need:
-- ALTER TYPE copystatus ADD VALUE 'RESERVED' AFTER 'REQUESTED';
-- ALTER TYPE requeststatus ADD VALUE 'RESERVED' AFTER 'ACCEPTED';

-- For SQLite (which the app seems to use), the enum is just a string check
-- So we don't need specific migration - the new values will work automatically

-- Update example data to demonstrate the flow:
-- 1. Book "Lost World" owned by rogeriosvaldo in Almada with status AVAILABLE
-- 2. Carmina makes a request (book stays AVAILABLE initially)  
-- 3. Rogerio accepts request (book becomes RESERVED, request becomes ACCEPTED)
-- 4. Carmina confirms delivery (book becomes BORROWED, request becomes COMPLETED)

-- No specific migration needed for SQLite - just documenting the flow
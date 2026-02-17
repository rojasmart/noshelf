-- Migration to add original_owner_id to copies table
-- This will help track transfer history

-- Add the new column
ALTER TABLE copies ADD COLUMN original_owner_id INTEGER;

-- Add foreign key constraint
ALTER TABLE copies ADD CONSTRAINT fk_copies_original_owner 
    FOREIGN KEY (original_owner_id) REFERENCES users(id);

-- Set original_owner_id = owner_id for existing records
UPDATE copies SET original_owner_id = owner_id WHERE original_owner_id IS NULL;

-- Verify the changes
SELECT id, owner_id, original_owner_id FROM copies;
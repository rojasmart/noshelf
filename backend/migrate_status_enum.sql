-- Migration to update status enums with new RESERVED status
-- Run this SQL script against your PostgreSQL database

-- First, check if the values already exist to avoid errors
-- Add RESERVED to CopyStatus enum if it doesn't exist
DO $$ 
BEGIN
    BEGIN
        ALTER TYPE copystatus ADD VALUE 'RESERVED' AFTER 'REQUESTED';
    EXCEPTION
        WHEN duplicate_object THEN
            RAISE NOTICE 'Value RESERVED already exists in copystatus enum';
    END;
END $$;

-- Add RESERVED to RequestStatus enum if it doesn't exist
DO $$ 
BEGIN
    BEGIN
        ALTER TYPE requeststatus ADD VALUE 'RESERVED' AFTER 'ACCEPTED';
    EXCEPTION
        WHEN duplicate_object THEN
            RAISE NOTICE 'Value RESERVED already exists in requeststatus enum';
    END;
END $$;

-- Verify the enum values
SELECT unnest(enum_range(NULL::copystatus)) AS copystatus_values;
SELECT unnest(enum_range(NULL::requeststatus)) AS requeststatus_values;

-- Update example data to demonstrate the flow:
-- 1. Book "Lost World" owned by rogeriosvaldo in Almada with status AVAILABLE
-- 2. Carmina makes a request (book stays AVAILABLE initially)  
-- 3. Rogerio accepts request (book becomes RESERVED, request becomes ACCEPTED)
-- 4. Carmina confirms delivery (book becomes BORROWED, request becomes COMPLETED)
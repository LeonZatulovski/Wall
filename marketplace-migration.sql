-- Marketplace Migration - Add missing columns
-- Run this in your Supabase SQL Editor to add the new columns

-- Add location column if it doesn't exist
ALTER TABLE marketplace_items 
ADD COLUMN IF NOT EXISTS location TEXT;

-- Add category column if it doesn't exist
ALTER TABLE marketplace_items 
ADD COLUMN IF NOT EXISTS category TEXT;

-- Add condition column if it doesn't exist
ALTER TABLE marketplace_items 
ADD COLUMN IF NOT EXISTS condition TEXT;

-- Update existing rows to have default values (optional)
UPDATE marketplace_items 
SET category = 'Other' 
WHERE category IS NULL;

UPDATE marketplace_items 
SET condition = 'Good' 
WHERE condition IS NULL; 
-- Marketplace Setup for Facebook Wall 2008
-- Run this in your Supabase SQL Editor

-- Create marketplace table to store items for sale
CREATE TABLE IF NOT EXISTS marketplace_items (
  id SERIAL PRIMARY KEY,
  seller_id TEXT NOT NULL,
  seller_email TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  location TEXT,
  category TEXT,
  condition TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_marketplace_seller_id ON marketplace_items(seller_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_created_at ON marketplace_items(created_at);
CREATE INDEX IF NOT EXISTS idx_marketplace_title ON marketplace_items USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_marketplace_description ON marketplace_items USING gin(to_tsvector('english', description));

-- Enable RLS
ALTER TABLE marketplace_items ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for demo
CREATE POLICY "Allow all operations on marketplace_items" ON marketplace_items FOR ALL USING (true);

-- Or disable RLS for demo
-- ALTER TABLE marketplace_items DISABLE ROW LEVEL SECURITY; 
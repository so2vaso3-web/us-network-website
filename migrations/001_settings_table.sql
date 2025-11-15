-- Migration: Create settings table for Postgres/Supabase
-- If using Vercel KV, this migration is not needed
-- Run this only if migrating to Postgres/Supabase

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1), -- Single row table
  data JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on updated_at for queries
CREATE INDEX IF NOT EXISTS idx_settings_updated_at ON settings(updated_at);

-- Insert default row if not exists
INSERT INTO settings (id, data) 
VALUES (1, '{"paypalEnabled": false, "cryptoEnabled": false, "websiteName": "US Mobile Networks", "paypalMode": "sandbox", "cryptoGateway": "manual"}')
ON CONFLICT (id) DO NOTHING;

-- Grant permissions (adjust as needed)
-- GRANT SELECT, UPDATE ON settings TO your_app_user;


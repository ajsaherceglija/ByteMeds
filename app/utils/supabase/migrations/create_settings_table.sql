-- Create settings table
CREATE TABLE IF NOT EXISTS system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default settings
INSERT INTO system_settings (key, value) VALUES
('registration', '{"enabled": true}'::jsonb),
('appointments', '{"enabled": true, "default_duration": 30, "max_daily": 8}'::jsonb),
('notifications', '{"enabled": true}'::jsonb),
('maintenance', '{"enabled": false}'::jsonb)
ON CONFLICT (key) DO NOTHING; 
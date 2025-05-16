-- Add is_admin column to users table
ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;

-- Set initial admin (replace 'your-admin-email@example.com' with actual admin email)
UPDATE users 
SET is_admin = TRUE 
WHERE email = 'your-admin-email@example.com'; 
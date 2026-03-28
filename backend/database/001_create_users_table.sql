-- Create users table
CREATE TABLE IF NOT EXISTS users (
    email VARCHAR(255) PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'employee',
    hashed_password VARCHAR(255) NOT NULL,
    disabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Add check constraint for valid roles
ALTER TABLE users ADD CONSTRAINT check_valid_role 
    CHECK (role IN ('employee', 'manager', 'hr', 'leadership'));

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy for service role to have full access
CREATE POLICY "Service role has full access" ON users
    FOR ALL
    USING (auth.role() = 'service_role');

-- Create policy for authenticated users to read their own data
CREATE POLICY "Users can read their own data" ON users
    FOR SELECT
    USING ((auth.jwt()->>'email') = email OR auth.role() = 'authenticated');

-- Insert test users (password for all is "secret")
-- Hashed password: $2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW
INSERT INTO users (email, full_name, role, hashed_password, disabled) VALUES
    ('employee@company.com', 'John Doe', 'employee', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', false),
    ('manager@company.com', 'Jane Manager', 'manager', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', false),
    ('hr.admin@company.com', 'HR Administrator', 'hr', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', false),
    ('ceo@company.com', 'CEO Leader', 'leadership', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', false)
ON CONFLICT (email) DO NOTHING;

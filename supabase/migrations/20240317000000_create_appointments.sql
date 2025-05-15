-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id BIGSERIAL PRIMARY KEY,
    patient_id UUID REFERENCES auth.users(id) NOT NULL,
    doctor_id UUID REFERENCES auth.users(id) NOT NULL,
    appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
    duration INTEGER NOT NULL, -- in minutes
    type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add RLS policies
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Doctors can view all their appointments
CREATE POLICY "Doctors can view their appointments"
    ON appointments FOR SELECT
    TO authenticated
    USING (
        auth.uid() = doctor_id
        AND EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role = 'doctor'
        )
    );

-- Doctors can create appointments
CREATE POLICY "Doctors can create appointments"
    ON appointments FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role = 'doctor'
        )
        AND doctor_id = auth.uid()
    );

-- Doctors can update their appointments
CREATE POLICY "Doctors can update their appointments"
    ON appointments FOR UPDATE
    TO authenticated
    USING (
        auth.uid() = doctor_id
        AND EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role = 'doctor'
        )
    )
    WITH CHECK (
        auth.uid() = doctor_id
        AND EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role = 'doctor'
        )
    );

-- Patients can view their own appointments
CREATE POLICY "Patients can view their appointments"
    ON appointments FOR SELECT
    TO authenticated
    USING (auth.uid() = patient_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_appointments_updated_at
    BEFORE UPDATE ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 
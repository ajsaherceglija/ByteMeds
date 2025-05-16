-- Function to convert a patient to a doctor
CREATE OR REPLACE FUNCTION convert_to_doctor(user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if the user exists and is a patient
    IF NOT EXISTS (
        SELECT 1 FROM users 
        WHERE id = user_id AND role = 'patient'
    ) THEN
        RAISE EXCEPTION 'User not found or is not a patient';
    END IF;

    -- Start transaction
    BEGIN
        -- Get patient data
        WITH patient_data AS (
            DELETE FROM patients
            WHERE user_id = $1
            RETURNING *
        )
        -- Insert into doctors table
        INSERT INTO doctors (user_id, specialization, license_number, status)
        SELECT 
            user_id,
            'General Practice', -- Default specialization
            'TBD', -- Placeholder for license number
            'active'
        FROM patient_data;

        -- Update user role
        UPDATE users
        SET role = 'doctor'
        WHERE id = user_id;

        -- Delete any existing patient appointments
        DELETE FROM appointments
        WHERE patient_id = user_id;

        -- Delete patient health parameters
        DELETE FROM health_parameters
        WHERE patient_id = user_id;

    EXCEPTION
        WHEN OTHERS THEN
            -- Rollback in case of any error
            RAISE EXCEPTION 'Failed to convert user to doctor: %', SQLERRM;
    END;
END;
$$; 
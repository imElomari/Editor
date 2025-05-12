-- Create test helpers schema
CREATE SCHEMA IF NOT EXISTS test_helpers;

-- Create function to create test users
CREATE OR REPLACE FUNCTION test_helpers.create_user(
    email text DEFAULT 'test@example.com',
    is_admin boolean DEFAULT false
) RETURNS uuid LANGUAGE plpgsql AS $$
DECLARE
    user_id uuid;
BEGIN
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at
    )
    VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        CASE WHEN is_admin THEN 'admin' ELSE 'authenticated' END,
        email,
        crypt('password', gen_salt('bf')),
        now(),
        jsonb_build_object('is_admin', is_admin),
        '{}',
        now(),
        now()
    )
    RETURNING id INTO user_id;

    RETURN user_id;
END;
$$;
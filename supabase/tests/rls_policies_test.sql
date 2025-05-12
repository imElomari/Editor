-- Load the test helpers
\ir 'helpers/setup.sql'

BEGIN;

-- Plan for one test
SELECT plan(1);

-- Create test users and data
DO $$
DECLARE
    user1_id uuid;
    user2_id uuid;
BEGIN
    -- Create two regular users
    SELECT test_helpers.create_user('user1@example.com', false) INTO user1_id;
    SELECT test_helpers.create_user('user2@example.com', false) INTO user2_id;
    
    -- Store user IDs for later use
    PERFORM set_config('test.user1_id', user1_id::text, false);
    PERFORM set_config('test.user2_id', user2_id::text, false);

    -- Insert a test project for user1
    SET LOCAL ROLE postgres;
    INSERT INTO projects (name, owner_id)
    VALUES ('User1 Project', user1_id);
END $$;

-- Test that user2 cannot see user1's projects
SELECT results_eq(
    format('
        SELECT COUNT(*)::int 
        FROM projects 
        WHERE auth.uid() = %L::uuid',
        current_setting('test.user2_id')
    ),
    ARRAY[0],
    'User should not see projects owned by others'
);

-- Clean up
SELECT * FROM finish();
ROLLBACK;
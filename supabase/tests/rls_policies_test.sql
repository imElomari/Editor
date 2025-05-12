-- Load the test helpers
\ir 'helpers/setup.sql'

BEGIN;

-- Plan total number of tests
SELECT plan(13);

-- Create test users and data
DO $$
DECLARE
    user1_id uuid;
    user2_id uuid;
    project1_id uuid;
    label1_id uuid;
    asset1_id uuid;
    asset2_id uuid;
BEGIN
    -- Create two regular users
    SELECT test_helpers.create_user('user1@example.com', false) INTO user1_id;
    SELECT test_helpers.create_user('user2@example.com', true) INTO user2_id;
    
    -- Store user IDs for later use
    PERFORM set_config('test.user1_id', user1_id::text, false);
    PERFORM set_config('test.user2_id', user2_id::text, false);

    -- Insert test project for user1
    SET LOCAL ROLE postgres;
    INSERT INTO projects (name, owner_id)
    VALUES ('User1 Project 1', user1_id)
    RETURNING id INTO project1_id;

    PERFORM set_config('test.project1_id', project1_id::text, false);

    -- Insert test label
    INSERT INTO labels (name, project_id, owner_id, label_json)
    VALUES ('Test Label', project1_id, user1_id, '{"color": "red"}'::jsonb)
    RETURNING id INTO label1_id;

    PERFORM set_config('test.label1_id', label1_id::text, false);

    -- Insert unused asset
    INSERT INTO assets (name, type, url, owner_id, is_used)
    VALUES ('user1-asset.png', 'image/png', '/test1', user1_id, false)
    RETURNING id INTO asset1_id;

    PERFORM set_config('test.asset1_id', asset1_id::text, false);

    -- Insert used asset
    INSERT INTO assets (name, type, url, owner_id, is_used)
    VALUES ('user1-used-asset.png', 'image/png', '/test2', user1_id, true);
    
END $$;

-- Helper function to set auth context
CREATE OR REPLACE FUNCTION set_auth_user(user_id uuid, is_admin boolean DEFAULT false)
RETURNS void AS $$
BEGIN
    PERFORM set_config('role', 'authenticated', true);
    PERFORM set_config('request.jwt.claim.sub', user_id::text, true);
    PERFORM set_config('request.jwt.claim.is_admin', is_admin::text, true);
END;
$$ LANGUAGE plpgsql;

-- Test 1: Users can view their own projects
DO $$
BEGIN
    PERFORM set_auth_user(current_setting('test.user1_id')::uuid);
END $$;
SELECT is(
    (SELECT COUNT(*)::int FROM projects WHERE owner_id = auth.uid()),
    1,
    'User should see their own projects'
);

-- Test 2: Users cannot view others projects
DO $$
BEGIN
    PERFORM set_auth_user(current_setting('test.user2_id')::uuid);
END $$;
SELECT is(
    (SELECT COUNT(*)::int FROM projects WHERE owner_id = current_setting('test.user1_id')::uuid),
    0,
    'User should not see projects owned by others'
);

-- Test 3: Users can create their own projects
DO $$
BEGIN
    PERFORM set_auth_user(current_setting('test.user1_id')::uuid);
END $$;
SELECT lives_ok(
    $$INSERT INTO projects (name, owner_id) 
    VALUES ('New Project', auth.uid())$$,
    'User should be able to create their own project'
);

-- Test 4: Users can update their own projects
DO $$
BEGIN
    PERFORM set_auth_user(current_setting('test.user1_id')::uuid);
END $$;
SELECT lives_ok(
    format(
        $$UPDATE projects 
        SET name = 'Updated Project ' || gen_random_uuid()
        WHERE owner_id = %L::uuid$$,
        current_setting('test.user1_id')
    ),
    'Users can update their own projects'
);

-- Test 5: Users can view labels in their projects
DO $$
BEGIN
    PERFORM set_auth_user(current_setting('test.user1_id')::uuid);
END $$;
SELECT is(
    (SELECT COUNT(*)::int FROM labels WHERE project_id = current_setting('test.project1_id')::uuid),
    1,
    'User should see labels in their projects'
);

-- Test 6: Users cannot view labels in others projects
DO $$
BEGIN
    PERFORM set_auth_user(current_setting('test.user2_id')::uuid);
END $$;
SELECT is(
    (SELECT COUNT(*)::int FROM labels),
    0,
    'User should not see labels in others projects'
);

-- Test 7: Users can create labels in their projects
DO $$
BEGIN
    PERFORM set_auth_user(current_setting('test.user1_id')::uuid);
END $$;
SELECT lives_ok(
    format(
        $$INSERT INTO labels (name, project_id, owner_id, label_json) 
        VALUES ('New Label', %L::uuid, auth.uid(), '{"color": "blue"}'::jsonb)$$,
        current_setting('test.project1_id')
    ),
    'User should be able to create labels in their projects'
);

-- Test 8: Users can update their own labels
DO $$
BEGIN
    PERFORM set_auth_user(current_setting('test.user1_id')::uuid);
END $$;
SELECT lives_ok(
    format(
        $$UPDATE labels 
        SET name = 'Updated Label'
        WHERE id = %L::uuid$$,
        current_setting('test.label1_id')
    ),
    'Users can update their own labels'
);

-- Add global asset
DO $$
BEGIN
    SET LOCAL ROLE postgres;
    INSERT INTO assets (name, type, url, owner_id, is_used)
    VALUES ('global-asset.png', 'image/png', '/test-global', null, false);
END $$;

-- Test 9: Users can view global assets
DO $$
BEGIN
    PERFORM set_auth_user(current_setting('test.user2_id')::uuid);
END $$;
SELECT isnt(
    (SELECT COUNT(*)::int FROM assets WHERE owner_id IS NULL),
    0,
    'Users can view global assets'
);

-- Test 10: Users can view their own assets
DO $$
BEGIN
    PERFORM set_auth_user(current_setting('test.user1_id')::uuid);
END $$;
SELECT is(
    (SELECT COUNT(*)::int FROM assets WHERE owner_id = auth.uid() AND name = 'user1-asset.png'),
    1,
    'Users can view their own assets'
);

-- Test 11: Users can create their own assets
DO $$
BEGIN
    PERFORM set_auth_user(current_setting('test.user1_id')::uuid);
END $$;
SELECT lives_ok(
    $$INSERT INTO assets (name, type, url, owner_id)
    VALUES ('own-asset.png', 'image/png', '/test5', auth.uid())$$,
    'Users can create their own assets'
);

-- Test 12: Users can update their own assets
DO $$
BEGIN
    PERFORM set_auth_user(current_setting('test.user1_id')::uuid);
END $$;
SELECT lives_ok(
    format(
        $$UPDATE assets 
        SET name = 'updated-asset.png'
        WHERE id = %L::uuid$$,
        current_setting('test.asset1_id')
    ),
    'Users can update their own assets'
);

-- Test 13: Users can delete their unused assets
DO $$
BEGIN
    PERFORM set_auth_user(current_setting('test.user1_id')::uuid);
END $$;
SELECT lives_ok(
    $$DELETE FROM assets 
    WHERE owner_id = auth.uid() AND is_used = false$$,
    'Users can delete their unused assets'
);


-- End tests
SELECT * FROM finish();
ROLLBACK;
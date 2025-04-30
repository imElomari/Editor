-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
    -- Projects
    DROP POLICY IF EXISTS "Users can view their own projects" ON projects;
    DROP POLICY IF EXISTS "Users can create their own projects" ON projects;
    DROP POLICY IF EXISTS "Users can update their own projects" ON projects;
    DROP POLICY IF EXISTS "Users can delete their own projects" ON projects;
    
    -- Labels
    DROP POLICY IF EXISTS "Users can view their own labels" ON labels;
    DROP POLICY IF EXISTS "Users can create their own labels" ON labels;
    DROP POLICY IF EXISTS "Users can update their own labels" ON labels;
    DROP POLICY IF EXISTS "Users can delete their own labels" ON labels;
    
    -- Assets
    DROP POLICY IF EXISTS "Users can view their own assets" ON assets;
    DROP POLICY IF EXISTS "Users can create their own assets" ON assets;
    DROP POLICY IF EXISTS "Users can update their own assets" ON assets;
    DROP POLICY IF EXISTS "Users can delete their own assets" ON assets;
END $$;

-- Projects Policies
CREATE POLICY "Users can view their own projects"
    ON projects FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "Users can create their own projects"
    ON projects FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update their own projects"
    ON projects FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Users can delete their own projects"
    ON projects FOR DELETE USING (owner_id = auth.uid());

-- Labels Policies
CREATE POLICY "Users can view their own labels"
    ON labels FOR SELECT
    USING (owner_id = auth.uid() OR project_id IN (
        SELECT id FROM projects WHERE owner_id = auth.uid()
    ));

CREATE POLICY "Users can create their own labels"
    ON labels FOR INSERT
    WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update their own labels"
    ON labels FOR UPDATE
    USING (owner_id = auth.uid());

CREATE POLICY "Users can delete their own labels"
    ON labels FOR DELETE
    USING (owner_id = auth.uid());

-- Assets Policies
CREATE POLICY "Users can view their own assets"
    ON assets FOR SELECT
    USING (owner_id = auth.uid() OR project_id IN (
        SELECT id FROM projects WHERE owner_id = auth.uid()
    ));

CREATE POLICY "Users can create their own assets"
    ON assets FOR INSERT
    WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update their own assets"
    ON assets FOR UPDATE
    USING (owner_id = auth.uid());

CREATE POLICY "Users can delete their own assets"
    ON assets FOR DELETE
    USING (owner_id = auth.uid());
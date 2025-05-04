-- Projects Table Policies
CREATE POLICY "Users can view their own projects"
ON public.projects FOR SELECT
USING (auth.uid() = owner_id);

CREATE POLICY "Users can create their own projects"
ON public.projects FOR INSERT
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own projects"
ON public.projects FOR UPDATE
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own projects"
ON public.projects FOR DELETE
USING (auth.uid() = owner_id);

-- Labels Table Policies
CREATE POLICY "Users can view their own labels"
ON public.labels FOR SELECT
USING (auth.uid() = owner_id);

CREATE POLICY "Users can create their own labels"
ON public.labels FOR INSERT
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own labels"
ON public.labels FOR UPDATE
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own labels"
ON public.labels FOR DELETE
USING (auth.uid() = owner_id);

-- Assets Table Policies

CREATE POLICY "Users can insert project assets"
ON assets FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = owner_id AND
  (project_id IS NULL OR EXISTS (
    SELECT 1 FROM projects 
    WHERE id = project_id AND owner_id = auth.uid()
  ))
);

CREATE POLICY "Users can view project assets"
ON assets FOR SELECT
TO authenticated
USING (
  owner_id = auth.uid() OR
  project_id IN (SELECT id FROM projects WHERE owner_id = auth.uid())
);
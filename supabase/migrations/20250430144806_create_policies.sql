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
CREATE POLICY "Users can insert assets"
ON assets FOR INSERT TO authenticated
WITH CHECK (
  -- Allow admin users to create global assets
  (auth.jwt()->>'is_admin' = 'true' AND owner_id IS NULL)
  OR
  -- Allow users to create their own assets
  (owner_id = auth.uid())
);

CREATE POLICY "Users can view assets"
ON assets FOR SELECT TO authenticated
USING (
  -- Anyone can view global assets
  owner_id IS NULL
  OR
  -- Users can view their own assets
  owner_id = auth.uid()
);

CREATE POLICY "Users can update their own assets"
ON assets FOR UPDATE TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

-- prevent deletion of used assets
CREATE POLICY "Users can delete their unused assets"
ON assets FOR DELETE TO authenticated
USING (
  owner_id = auth.uid() AND 
  is_used = false
);

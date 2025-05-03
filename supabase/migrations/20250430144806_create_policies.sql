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
CREATE POLICY "Users can view their own assets"
ON public.assets FOR SELECT
USING (auth.uid() = owner_id);

CREATE POLICY "Users can create their own assets"
ON public.assets FOR INSERT
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own assets"
ON public.assets FOR UPDATE
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own assets"
ON public.assets FOR DELETE
USING (auth.uid() = owner_id);
-- Drop existing policies if they exist
DO $$ 
BEGIN
    -- Storage policies
    DROP POLICY IF EXISTS "Users can view their project assets" ON storage.objects;
    DROP POLICY IF EXISTS "Users can upload project assets" ON storage.objects;
    DROP POLICY IF EXISTS "Users can update project assets" ON storage.objects;
    DROP POLICY IF EXISTS "Users can delete project assets" ON storage.objects;
    DROP POLICY IF EXISTS "Users can view global assets" ON storage.objects;
    DROP POLICY IF EXISTS "Users can upload global assets" ON storage.objects;
    DROP POLICY IF EXISTS "Users can update global assets" ON storage.objects;
    DROP POLICY IF EXISTS "Users can delete global assets" ON storage.objects;
END $$;

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('project-assets', 'project-assets', false, 52428800,
    ARRAY[
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'font/ttf',
      'font/otf',
      'font/woff',
      'font/woff2'
    ]
  ),
  ('global-assets', 'global-assets', false, 52428800,
    ARRAY[
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'font/ttf',
      'font/otf',
      'font/woff',
      'font/woff2'
    ]
  )
ON CONFLICT (id) DO NOTHING;

-- Project assets policies
CREATE POLICY "Users can view their project assets"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'project-assets' AND 
    EXISTS (
      SELECT 1 FROM projects 
      WHERE id::text = SPLIT_PART(name, '/', 1)
      AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can upload project assets"
  ON storage.objects FOR INSERT 
  WITH CHECK (
    bucket_id = 'project-assets' AND 
    EXISTS (
      SELECT 1 FROM projects 
      WHERE id::text = SPLIT_PART(name, '/', 1)
      AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update project assets"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'project-assets' AND 
    EXISTS (
      SELECT 1 FROM projects 
      WHERE id::text = SPLIT_PART(name, '/', 1)
      AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete project assets"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'project-assets' AND 
    EXISTS (
      SELECT 1 FROM projects 
      WHERE id::text = SPLIT_PART(name, '/', 1)
      AND owner_id = auth.uid()
    )
  );

-- Global assets policies
CREATE POLICY "Users can view global assets"
  ON storage.objects FOR SELECT 
  USING (
    bucket_id = 'global-assets' AND 
    auth.uid()::text = SPLIT_PART(name, '/', 1)
  );

CREATE POLICY "Users can upload global assets"
  ON storage.objects FOR INSERT 
  WITH CHECK (
    bucket_id = 'global-assets' AND 
    auth.uid()::text = SPLIT_PART(name, '/', 1)
  );

CREATE POLICY "Users can update global assets"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'global-assets' AND 
    auth.uid()::text = SPLIT_PART(name, '/', 1)
  );

CREATE POLICY "Users can delete global assets"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'global-assets' AND 
    auth.uid()::text = SPLIT_PART(name, '/', 1)
  );
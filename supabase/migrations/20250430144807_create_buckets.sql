-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('project-assets', 'project-assets', false, 52428800, -- 50MB
    ARRAY[
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'font/ttf'
    ]
  ),
  ('global-assets', 'global-assets', false, 52428800,
    ARRAY[
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'font/ttf'
    ]
  );

-- Set up storage policies for project assets
CREATE POLICY "Users can view their project assets"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'project-assets' AND 
    auth.uid() = (SELECT owner_id FROM projects WHERE id::text = (storage.foldername(name))[1])
  );

CREATE POLICY "Users can upload project assets"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'project-assets' AND
    auth.uid() = (SELECT owner_id FROM projects WHERE id::text = (storage.foldername(name))[1])
  );

CREATE POLICY "Users can update their project assets"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'project-assets' AND
    auth.uid() = (SELECT owner_id FROM projects WHERE id::text = (storage.foldername(name))[1])
  );

-- Set up storage policies for global assets
CREATE POLICY "Users can view their global assets"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'global-assets' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can upload global assets"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'global-assets' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their global assets"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'global-assets' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Add DELETE policies for storage
CREATE POLICY "Users can delete their project assets"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'project-assets' AND 
        auth.uid() = (SELECT owner_id FROM projects WHERE id::text = (storage.foldername(name))[1])
    );

CREATE POLICY "Users can delete their global assets"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'global-assets' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );
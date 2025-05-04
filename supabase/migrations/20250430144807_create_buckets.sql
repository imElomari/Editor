-- Enable Row Level Security
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create storage buckets with proper configurations
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('project-assets', 'project-assets', true, 52428800, -- 50MB limit
    ARRAY[
      'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/svg+xml',
  'font/ttf',
  'font/otf',
  'font/woff',
  'font/woff2',
  'application/json',
  'text/css',
  'text/javascript',
  'application/javascript',
  'text/plain'
    ]
  ),
  ('global-assets', 'global-assets', true, 52428800, -- 50MB limit
    ARRAY[
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/svg+xml',
      'font/ttf',
      'font/otf',
      'font/woff',
      'font/woff2',
      'application/json',
      'text/css',
      'text/javascript',
      'application/javascript',
      'text/plain'
    ]
  )
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Create policies for the storage buckets

-- Project Assets Policies
CREATE POLICY "Enable read access for authenticated users"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'project-assets' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Enable upload access for authenticated users"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'project-assets' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Allow authenticated users to upload project assets"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'project-assets'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Allow users to delete their own project assets"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'project-assets'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Global Assets Policies
CREATE POLICY "Allow owners to read their global assets"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'global-assets'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Allow owners to upload global assets"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'global-assets'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Allow owners to delete their global assets"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'global-assets'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
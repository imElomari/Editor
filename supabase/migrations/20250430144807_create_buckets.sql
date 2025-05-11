-- Enable Row Level Security
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create storage buckets with proper configurations
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('assets', 'assets', true, 52428800, -- 50MB limit
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

-- Create policy for both project and global uploads
CREATE POLICY "Allow authenticated users to upload assets"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'assets' AND
  (
    -- Allow admin users to upload to global/*
    (SPLIT_PART(name, '/', 1) = 'global' AND auth.jwt()->>'is_admin' = 'true')
    OR
    -- Allow authenticated users to upload to user/*
    (SPLIT_PART(name, '/', 1) = 'user' AND auth.role() = 'authenticated')
  )
);

-- Add a policy for viewing assets
CREATE POLICY "Allow users to read assets"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'assets' AND
  (
    -- Anyone can read global assets
    SPLIT_PART(name, '/', 1) = 'global'
    OR
    -- Anyone can read user assets
    SPLIT_PART(name, '/', 1) = 'user'
  )
);

-- Add DELETE permission to storage policy
CREATE POLICY "Allow users to delete their assets"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'assets' AND
  (
    -- Allow admin users to delete from global/*
    (SPLIT_PART(name, '/', 1) = 'global' AND auth.jwt()->>'is_admin' = 'true')
    OR
    -- Allow users to delete from user/*
    (SPLIT_PART(name, '/', 1) = 'user' AND auth.role() = 'authenticated')
  )
);
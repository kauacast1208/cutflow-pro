
-- Allow authenticated users to upload to the logos bucket
CREATE POLICY "Allow authenticated uploads to logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'logos');

-- Allow authenticated users to update their logos
CREATE POLICY "Allow authenticated updates to logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'logos')
WITH CHECK (bucket_id = 'logos');

-- Allow public read access to logos
CREATE POLICY "Allow public read access to logos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'logos');

-- Allow authenticated users to delete their logos
CREATE POLICY "Allow authenticated deletes on logos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'logos');

-- Create a new public bucket for game images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('games', 'games', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to read the files
CREATE POLICY "Public Read Access Games" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'games');

-- Allow users to insert files
CREATE POLICY "Public Insert Access Games" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'games');

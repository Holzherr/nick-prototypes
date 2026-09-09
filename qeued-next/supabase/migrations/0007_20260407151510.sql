
-- Allow anon to view follows
CREATE POLICY "Anon can view follows" ON public.follows FOR SELECT TO anon USING (true);

-- Allow authenticated users to view watch_entries of public profiles (currently they can only see their own)
CREATE POLICY "Auth can view entries of public profiles" ON public.watch_entries FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles WHERE profiles.user_id = watch_entries.user_id AND profiles.is_public = true
  )
);

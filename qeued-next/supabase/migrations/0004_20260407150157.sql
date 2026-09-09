
-- Add username and is_public to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username text UNIQUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT true;

-- Create follows table
CREATE TABLE public.follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can see follows
CREATE POLICY "Anyone can view follows" ON public.follows FOR SELECT TO authenticated USING (true);

-- Users can follow others
CREATE POLICY "Users can follow" ON public.follows FOR INSERT TO authenticated WITH CHECK (auth.uid() = follower_id);

-- Users can unfollow
CREATE POLICY "Users can unfollow" ON public.follows FOR DELETE TO authenticated USING (auth.uid() = follower_id);

-- Allow public (anon) to read public profiles
CREATE POLICY "Anon can view public profiles" ON public.profiles FOR SELECT TO anon USING (is_public = true);

-- Allow public to read watch_entries for public profiles
CREATE POLICY "Anon can view entries of public profiles" ON public.watch_entries FOR SELECT TO anon
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.user_id = watch_entries.user_id AND profiles.is_public = true));

-- Allow anon to read titles
CREATE POLICY "Anon can view titles" ON public.titles FOR SELECT TO anon USING (true);

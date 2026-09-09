
-- Create enum types
CREATE TYPE public.watch_status AS ENUM ('watched', 'watching', 'want_to_watch', 'dropped');
CREATE TYPE public.connection_status AS ENUM ('pending', 'accepted');
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
CREATE TYPE public.title_type AS ENUM ('movie', 'series');

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Titles table (AI-generated movie/series data cache)
CREATE TABLE public.titles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type public.title_type NOT NULL DEFAULT 'movie',
  genres TEXT[] NOT NULL DEFAULT '{}',
  imdb_rating NUMERIC(3,1),
  rt_rating INTEGER,
  description TEXT,
  image_url TEXT,
  year INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.titles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Titles are viewable by everyone" ON public.titles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Service role can insert titles" ON public.titles FOR INSERT TO service_role WITH CHECK (true);
CREATE INDEX idx_titles_name ON public.titles USING gin(to_tsvector('english', name));

-- Watch entries table
CREATE TABLE public.watch_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title_id UUID REFERENCES public.titles(id) ON DELETE CASCADE NOT NULL,
  status public.watch_status NOT NULL DEFAULT 'want_to_watch',
  watched_rating INTEGER CHECK (watched_rating >= 1 AND watched_rating <= 5),
  desire_ranking INTEGER CHECK (desire_ranking >= 1 AND desire_ranking <= 10),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, title_id)
);
ALTER TABLE public.watch_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own entries" ON public.watch_entries FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own entries" ON public.watch_entries FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own entries" ON public.watch_entries FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own entries" ON public.watch_entries FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER update_watch_entries_updated_at BEFORE UPDATE ON public.watch_entries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Connections table
CREATE TABLE public.connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_1 UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user_2 UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status public.connection_status NOT NULL DEFAULT 'pending',
  invite_code TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT different_users CHECK (user_1 != user_2)
);
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own connections" ON public.connections FOR SELECT TO authenticated USING (auth.uid() = user_1 OR auth.uid() = user_2);
CREATE POLICY "Users can create connections" ON public.connections FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_1);
CREATE POLICY "Users can update own connections" ON public.connections FOR UPDATE TO authenticated USING (auth.uid() = user_1 OR auth.uid() = user_2);

-- User roles table
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- AI cache table
CREATE TABLE public.ai_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cache_key TEXT NOT NULL UNIQUE,
  response_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '24 hours')
);
ALTER TABLE public.ai_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cache readable by service role" ON public.ai_cache FOR SELECT TO service_role USING (true);
CREATE POLICY "Cache writable by service role" ON public.ai_cache FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Cache deletable by service role" ON public.ai_cache FOR DELETE TO service_role USING (true);

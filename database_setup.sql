-- Create games table
CREATE TABLE public.games (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create matches table
CREATE TABLE public.matches (
  id uuid default gen_random_uuid() primary key,
  game_id uuid references public.games(id) on delete cascade not null,
  date_played date not null default CURRENT_DATE,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create match_results table
CREATE TABLE public.match_results (
  id uuid default gen_random_uuid() primary key,
  match_id uuid references public.matches(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  score integer,
  is_winner boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users full access to games" ON public.games FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users full access to matches" ON public.matches FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users full access to match_results" ON public.match_results FOR ALL USING (auth.role() = 'authenticated');

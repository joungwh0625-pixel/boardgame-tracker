-- Add team column to match_results table to support team-based board games
ALTER TABLE public.match_results ADD COLUMN IF NOT EXISTS team text;

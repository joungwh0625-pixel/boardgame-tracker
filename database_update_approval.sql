-- 1. matches 테이블 변경
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS creator_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- 기존에 등록된 매치들은 모두 'approved' 처리
UPDATE public.matches SET status = 'approved' WHERE status = 'pending';

-- 2. match_results 테이블 변경
ALTER TABLE public.match_results ADD COLUMN IF NOT EXISTS is_approved boolean DEFAULT false;

-- 기존 기록들은 모두 승인된 것으로 처리
UPDATE public.match_results SET is_approved = true WHERE is_approved = false;

-- 3. API 스키마 캐시 갱신
NOTIFY pgrst, 'reload schema';

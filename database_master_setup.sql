-- 1. profiles 테이블에 is_master 컬럼 추가
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_master BOOLEAN DEFAULT false;

-- 2. 현재 가입되어 있는 모든 기존 사용자를 '마스터'로 자동 승급 (초기 세팅용)
UPDATE public.profiles SET is_master = true;

-- 3. games 테이블에 RLS 적용 및 정책 초기화
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable select for authenticated" ON public.games;
DROP POLICY IF EXISTS "Enable insert for authenticated" ON public.games;
DROP POLICY IF EXISTS "Enable update for masters" ON public.games;
DROP POLICY IF EXISTS "Enable delete for masters" ON public.games;

-- 누구나 게임 목록을 볼 수 있음
CREATE POLICY "Enable select for authenticated" ON public.games FOR SELECT USING (auth.role() = 'authenticated');

-- 누구나 새 게임을 등록할 수 있음
CREATE POLICY "Enable insert for authenticated" ON public.games FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 마스터만 게임을 수정할 수 있음
CREATE POLICY "Enable update for masters" ON public.games FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_master = true)
);

-- 마스터만 게임을 삭제할 수 있음
CREATE POLICY "Enable delete for masters" ON public.games FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_master = true)
);

-- 4. profiles 테이블 업데이트 정책 추가 (마스터가 다른 사람의 권한을 변경할 수 있도록 허용)
DROP POLICY IF EXISTS "Enable master update on profiles" ON public.profiles;

CREATE POLICY "Enable master update on profiles" ON public.profiles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_master = true)
);

-- 캐시 새로고침
NOTIFY pgrst, 'reload schema';

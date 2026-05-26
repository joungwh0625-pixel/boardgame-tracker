-- 1. profiles 테이블에 보동 포인트 컬럼 추가
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bodong integer DEFAULT 0;

-- 2. 기존에 승인된 다인 플레이 매치 승리자에게 1승당 100 보동 소급 지급
UPDATE public.profiles p
SET bodong = bodong + (
  SELECT count(*) * 100
  FROM public.match_results mr
  JOIN public.matches m ON mr.match_id = m.id
  WHERE mr.user_id = p.id
    AND mr.is_winner = true
    AND m.status = 'approved'
    AND (SELECT count(*) FROM public.match_results mr2 WHERE mr2.match_id = m.id) > 1
);

-- 3. matches 테이블의 date_played 타입을 시간까지 담을 수 있는 timestamp로 변경
ALTER TABLE public.matches ALTER COLUMN date_played TYPE timestamp with time zone USING date_played::timestamp with time zone;

-- 4. API 스키마 캐시 갱신
NOTIFY pgrst, 'reload schema';

-- 기존에 가입된 테스트 유저들의 username(아이디)를 이메일 앞부분으로 덮어씌움
UPDATE public.profiles
SET username = split_part(email, '@', 1)
WHERE username IS NULL OR username = '';

-- 앞으로 가입하는 유저들도 별도의 아이디 입력 없이 이메일 앞부분을 아이디(username)로 쓰도록 트리거 수정
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, username, avatar_url)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- API 스키마 캐시 갱신
NOTIFY pgrst, 'reload schema';

import { signup } from './actions'
import Link from 'next/link'
import SocialLogins from '@/components/SocialLogins'

export default async function SignupPage(props: { searchParams: Promise<{ message: string }> }) {
  const searchParams = await props.searchParams;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <div className="card" style={{ width: '100%' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '24px' }}>회원가입</h1>
        {searchParams?.message && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', textAlign: 'center' }}>
            {searchParams.message}
          </div>
        )}

        <SocialLogins />

        <div style={{ position: 'relative', margin: '24px 0', textAlign: 'center' }}>
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, borderTop: '1px solid var(--border-color)', zIndex: 1 }}></div>
          <span style={{ position: 'relative', background: 'var(--surface-color)', padding: '0 10px', color: 'var(--text-muted)', fontSize: '14px', zIndex: 2 }}>
            또는 이메일로 가입하기
          </span>
        </div>

        <form action={signup}>
          <div className="form-group">
            <label htmlFor="email">이메일</label>
            <input id="email" name="email" type="email" required placeholder="예: user@board.com" />
          </div>
          <div className="form-group">
            <label htmlFor="password">비밀번호 (6자 이상)</label>
            <input id="password" name="password" type="password" required minLength={6} />
          </div>
          <div className="form-group">
            <label htmlFor="display_name">이름 (또는 닉네임)</label>
            <input id="display_name" name="display_name" type="text" required />
          </div>
          <div className="form-group">
            <label htmlFor="avatar_file">프로필 사진 (선택)</label>
            <input id="avatar_file" name="avatar_file" type="file" accept="image/*" />
          </div>
          <button className="btn btn-primary" type="submit" style={{ marginBottom: '16px' }}>이메일로 회원가입</button>
        </form>
        <div style={{ textAlign: 'center', fontSize: '14px', marginTop: '24px' }}>
          <Link href="/login" style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>로그인으로 돌아가기</Link>
        </div>
      </div>
    </div>
  )
}

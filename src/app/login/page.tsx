import { login } from './actions'
import Link from 'next/link'
import SocialLogins from '@/components/SocialLogins'

export default async function LoginPage(props: { searchParams: Promise<{ message: string }> }) {
  const searchParams = await props.searchParams;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <div className="card" style={{ width: '100%' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '24px' }}>로그인</h1>
        {searchParams?.message && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', textAlign: 'center' }}>
            {searchParams.message}
          </div>
        )}
        <form action={login}>
          <div className="form-group">
            <label htmlFor="email">이메일</label>
            <input id="email" name="email" type="email" required placeholder="예: user@board.com" />
          </div>
          <div className="form-group">
            <label htmlFor="password">비밀번호</label>
            <input id="password" name="password" type="password" required />
          </div>
          <button className="btn btn-primary" type="submit" style={{ marginBottom: '16px' }}>이메일로 로그인</button>
        </form>

        <SocialLogins />
        
        <div style={{ textAlign: 'center', fontSize: '14px', marginTop: '24px' }}>
          <span style={{ color: 'var(--text-muted)' }}>계정이 없으신가요? </span>
          <Link href="/signup" style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 'bold' }}>회원가입</Link>
        </div>
      </div>
    </div>
  )
}

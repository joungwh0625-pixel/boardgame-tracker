import { signup } from './actions'
import Link from 'next/link'

export default async function SignupPage(props: { searchParams: Promise<{ message: string }> }) {
  const searchParams = await props.searchParams;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '20px 0' }}>
      <div className="card" style={{ width: '100%' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '24px' }}>회원가입</h1>
        {searchParams?.message && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', textAlign: 'center' }}>
            {searchParams.message}
          </div>
        )}

        <form action={signup}>
          <div className="form-group">
            <label htmlFor="email">이메일</label>
            <input id="email" name="email" type="email" required />
          </div>
          <div className="form-group">
            <label htmlFor="password">비밀번호</label>
            <input id="password" name="password" type="password" required />
          </div>
          <div className="form-group">
            <label htmlFor="display_name">닉네임</label>
            <input id="display_name" name="display_name" type="text" required />
          </div>
          <div className="form-group">
            <label htmlFor="avatar_file">프로필 이미지 (선택)</label>
            <input id="avatar_file" name="avatar_file" type="file" accept="image/*" />
          </div>
          <button className="btn btn-primary" type="submit" style={{ marginTop: '8px' }}>가입하기</button>
        </form>
        <div style={{ textAlign: 'center', fontSize: '14px', marginTop: '16px' }}>
          <Link href="/login" style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>로그인으로 돌아가기</Link>
        </div>
      </div>
    </div>
  )
}

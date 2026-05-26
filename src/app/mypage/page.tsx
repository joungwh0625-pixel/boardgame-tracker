import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { updateProfile } from './actions'

export default async function MyPage(props: { searchParams: Promise<{ message: string }> }) {
  const searchParams = await props.searchParams;
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '20px', margin: 0 }}>👤 마이페이지</h1>
        <Link href="/" style={{ fontSize: '14px', color: 'var(--text-muted)', textDecoration: 'none' }}>&larr; 홈으로</Link>
      </div>

      {searchParams?.message && (
        <div style={{ backgroundColor: searchParams.message.includes('완료') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: searchParams.message.includes('완료') ? 'var(--success)' : 'var(--danger)', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', textAlign: 'center' }}>
          {searchParams.message}
        </div>
      )}

      <form action={updateProfile}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: 'var(--bg-color)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', border: '2px solid var(--border-color)', marginBottom: '16px' }}>
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              '👤'
            )}
          </div>
          <div className="form-group" style={{ width: '100%' }}>
            <label htmlFor="avatar_file">새 프로필 이미지 (선택)</label>
            <input id="avatar_file" name="avatar_file" type="file" accept="image/*" />
          </div>
        </div>

        <div className="form-group">
          <label>아이디</label>
          <input type="text" value={profile?.username || ''} disabled style={{ backgroundColor: 'var(--bg-color)', opacity: 0.7 }} />
        </div>

        <div className="form-group">
          <label>이메일</label>
          <input type="email" value={profile?.email || ''} disabled style={{ backgroundColor: 'var(--bg-color)', opacity: 0.7 }} />
        </div>

        <div className="form-group">
          <label htmlFor="display_name">닉네임</label>
          <input id="display_name" name="display_name" type="text" defaultValue={profile?.display_name || ''} required />
        </div>

        <button className="btn btn-primary" type="submit" style={{ marginTop: '16px' }}>정보 수정하기</button>
      </form>
    </div>
  )
}

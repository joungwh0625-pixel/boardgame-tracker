import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function RankingPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/login')
  }

  // Fetch all profiles sorted by bodong descending
  const { data: profiles } = await supabase.from('profiles')
    .select('id, display_name, username, avatar_url, bodong')
    .order('bodong', { ascending: false, nullsFirst: false })
    .order('display_name', { ascending: true })

  return (
    <>
      <header className="header">
        <div>
          <h1 className="title">🏆 보동 랭킹</h1>
          <p className="subtitle">가장 많은 보동 포인트를 모은 유저는 누구일까요?</p>
        </div>
      </header>

      <div style={{ paddingBottom: '80px' }}>
        <section className="card">
          {profiles && profiles.length > 0 ? (
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {profiles.map((p, idx) => (
                <li key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: idx < profiles.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ 
                      width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                      backgroundColor: idx === 0 ? '#fbbf24' : idx === 1 ? '#94a3b8' : idx === 2 ? '#b45309' : 'var(--border-color)',
                      color: idx < 3 ? 'white' : 'var(--text-muted)', fontWeight: 'bold', fontSize: '14px'
                    }}>
                      {idx + 1}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--border-color)', overflow: 'hidden' }}>
                        {p.avatar_url ? (
                          <img src={p.avatar_url} alt={p.display_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>👤</div>
                        )}
                      </div>
                      <Link href={`/users/${p.id}`} style={{ fontWeight: '600', color: 'var(--text-main)', textDecoration: 'none', fontSize: '16px' }}>
                        {p.display_name} <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>({p.username})</span>
                      </Link>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 'bold', color: '#fbbf24', fontSize: '18px' }}>
                      {(p.bodong || 0).toLocaleString()} <span style={{ fontSize: '14px', color: 'var(--text-main)' }}>보동</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>유저가 없습니다.</p>
          )}
        </section>
      </div>
    </>
  )
}

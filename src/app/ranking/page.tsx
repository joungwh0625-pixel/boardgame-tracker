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

  // Calculate ranks handling ties
  let currentRank = 0;
  let previousBodong = -1;
  const leaderboard = profiles?.map((p, index) => {
    const bodong = p.bodong || 0;
    if (index === 0 || bodong !== previousBodong) {
      currentRank = index + 1;
      previousBodong = bodong;
    }
    return { profile: p, bodong, rank: currentRank };
  }) || [];

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
          {leaderboard && leaderboard.length > 0 ? (
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {leaderboard.map((stat, idx) => (
                <li key={stat.profile.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: idx < leaderboard.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ 
                      width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                      backgroundColor: stat.rank === 1 ? '#fbbf24' : stat.rank === 2 ? '#94a3b8' : stat.rank === 3 ? '#b45309' : 'var(--border-color)',
                      color: stat.rank <= 3 ? 'white' : 'var(--text-muted)', fontWeight: 'bold', fontSize: '14px'
                    }}>
                      {stat.rank}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--border-color)', overflow: 'hidden' }}>
                        {stat.profile.avatar_url ? (
                          <img src={stat.profile.avatar_url} alt={stat.profile.display_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>👤</div>
                        )}
                      </div>
                      <Link href={`/users/${stat.profile.id}`} style={{ fontWeight: '600', color: 'var(--text-main)', textDecoration: 'none', fontSize: '16px' }}>
                        {stat.profile.display_name} <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>({stat.profile.username})</span>
                      </Link>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 'bold', color: '#fbbf24', fontSize: '18px', whiteSpace: 'nowrap' }}>
                      {stat.bodong.toLocaleString()} <span style={{ fontSize: '14px', color: 'var(--text-main)' }}>보동</span>
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

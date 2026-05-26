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

  // Fetch all profiles
  const { data: profiles } = await supabase.from('profiles')
    .select('id, display_name, username, avatar_url, bodong')

  // Fetch all match results
  const { data: allResults } = await supabase.from('match_results').select(`
    match_id, is_winner, user_id,
    matches!inner(status)
  `).eq('matches.status', 'approved')

  // Pre-calculate participants per match to identify solo plays
  const participantsPerMatch: Record<string, number> = {}
  allResults?.forEach((r: any) => {
    participantsPerMatch[r.match_id] = (participantsPerMatch[r.match_id] || 0) + 1
  })

  // Calculate stats for each profile
  const userStats: Record<string, { profile: any, total: number, wins: number }> = {}
  profiles?.forEach(p => {
    userStats[p.id] = { profile: p, total: 0, wins: 0 }
  })

  allResults?.forEach((r: any) => {
    const isSolo = participantsPerMatch[r.match_id] === 1
    if (isSolo) return // Skip solo plays

    if (userStats[r.user_id]) {
      userStats[r.user_id].total += 1
      if (r.is_winner) userStats[r.user_id].wins += 1
    }
  })

  // Sort: 1st by wins DESC, 2nd by total games ASC
  const leaderboard = Object.values(userStats)
    .sort((a, b) => b.wins - a.wins || a.total - b.total)
    // Only show users with at least 1 game
    .filter(stat => stat.total > 0)

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
                      backgroundColor: idx === 0 ? '#fbbf24' : idx === 1 ? '#94a3b8' : idx === 2 ? '#b45309' : 'var(--border-color)',
                      color: idx < 3 ? 'white' : 'var(--text-muted)', fontWeight: 'bold', fontSize: '14px'
                    }}>
                      {idx + 1}
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
                    <div style={{ fontWeight: 'bold', color: 'var(--primary-color)', fontSize: '16px' }}>
                      {stat.total}전 {stat.wins}승 {stat.total - stat.wins}패
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

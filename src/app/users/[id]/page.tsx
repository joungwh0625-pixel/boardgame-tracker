import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function UserProfilePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', params.id).single()
  if (!profile) return <div>유저를 찾을 수 없습니다.</div>

  // Fetch matches where this user participated
  const { data: matchResults } = await supabase.from('match_results')
    .select('match_id')
    .eq('user_id', params.id)

  const matchIds = matchResults?.map(mr => mr.match_id) || []

  let matches: any[] = []
  if (matchIds.length > 0) {
    const { data } = await supabase.from('matches')
      .select(`
        id, date_played, created_at,
        games(id, title),
        match_results(
          score, is_winner, user_id, team,
          profiles(display_name, username)
        )
      `)
      .in('id', matchIds)
      .eq('status', 'approved')
      .order('date_played', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(50)
    matches = data || []
  }

  // Calculate overall stats for this user
  let totalGames = 0
  let wins = 0
  matches.forEach(m => {
    const isSolo = m.match_results.length === 1
    if (!isSolo) {
      const myResult = m.match_results.find((r: any) => r.user_id === params.id)
      if (myResult) {
        totalGames++
        if (myResult.is_winner) wins++
      }
    }
  })
  const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '20px', margin: 0 }}>👤 유저 정보</h1>
        <Link href="/" style={{ fontSize: '14px', color: 'var(--text-muted)', textDecoration: 'none' }}>&larr; 돌아가기</Link>
      </div>

      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--bg-color)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', border: '2px solid var(--border-color)', flexShrink: 0 }}>
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            '👤'
          )}
        </div>
        <div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{profile.display_name}</div>
          <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>@{profile.username}</div>
          <div style={{ marginTop: '12px', display: 'flex', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>승률</div>
              <div style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>{winRate}%</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>전적</div>
              <div style={{ fontWeight: 'bold' }}>{totalGames}전 {wins}승 {totalGames - wins}패</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>최근 전적</h2>
        {matches.length > 0 ? (
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {matches.map((m: any) => {
              const participantCount = m.match_results?.length || 0;
              const isSolo = participantCount === 1;

              return (
                <li key={m.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{m.date_played} • {m.games?.title || '알 수 없는 게임'} {isSolo && '(솔로 플레이)'}</div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {m.match_results?.map((r: any, i: number) => (
                      <Link href={`/users/${r.user_id}`} key={i} style={{ padding: '6px 12px', borderRadius: '20px', backgroundColor: r.is_winner && !isSolo ? 'rgba(16, 185, 129, 0.1)' : 'var(--border-color)', border: `1px solid ${r.is_winner && !isSolo ? 'var(--success)' : (r.user_id === params.id ? 'var(--primary-color)' : 'transparent')}`, fontSize: '14px', color: r.is_winner && !isSolo ? 'var(--success)' : 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
                        {r.is_winner && !isSolo && '👑'} {r.team ? `[${r.team}팀] ` : ''}{r.profiles ? `${r.profiles.display_name}(${r.profiles.username})` : '알 수 없는 유저'} {r.score !== null && <span style={{ opacity: 0.7 }}>{r.score} 점</span>}
                      </Link>
                    ))}
                  </div>
                </li>
              )
            })}
          </ul>
        ) : (
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>기록된 전적이 없습니다.</p>
        )}
      </div>
    </>
  )
}

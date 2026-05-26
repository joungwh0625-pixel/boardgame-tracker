'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { deleteMatch } from '@/app/matches/actions'

export default function DashboardClient({ games, matches, allResults, myUserId, isMaster }: any) {
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null)
  const [showFullLeaderboard, setShowFullLeaderboard] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleDelete = (matchId: string) => {
    if (confirm('정말 이 전적을 삭제하시겠습니까? 삭제 시 복구할 수 없습니다.')) {
      startTransition(async () => {
        await deleteMatch(matchId)
      })
    }
  }

  // Pre-calculate participants per match to identify solo plays
  const participantsPerMatch: Record<string, number> = {}
  allResults.forEach((r: any) => {
    participantsPerMatch[r.match_id] = (participantsPerMatch[r.match_id] || 0) + 1
  })

  // Filter allResults by selectedGameId
  const filteredResults = allResults.filter((r: any) => {
    if (selectedGameId && r.matches?.game_id !== selectedGameId) return false
    return true
  })

  // Calculate stats (exclude solo plays for win rate)
  const userStats: Record<string, { uid: string, name: string, total: number, wins: number, rate: number, bodong?: number }> = {}
  filteredResults.forEach((r: any) => {
    const isSolo = participantsPerMatch[r.match_id] === 1
    if (isSolo || !r.user_id) return // Skip solo plays and external users

    const uid = r.user_id
    if (!userStats[uid]) {
      userStats[uid] = { uid, name: r.profiles ? `${r.profiles.display_name}(${r.profiles.username})` : '알 수 없는 유저', total: 0, wins: 0, rate: 0, bodong: r.profiles?.bodong || 0 }
    }
    userStats[uid].total += 1
    if (r.is_winner) userStats[uid].wins += 1
  })

  // Calculate rate for all users first
  Object.values(userStats).forEach(stat => {
    stat.rate = stat.total > 0 ? Number(((stat.wins / stat.total) * 100).toFixed(1)) : 0;
  });

  const leaderboard = Object.values(userStats)
    .sort((a, b) => b.rate - a.rate || b.wins - a.wins)

  const myStats = userStats[myUserId]

  // Filter recent matches
  const filteredMatches = matches.filter((m: any) => {
    if (selectedGameId && m.games?.id !== selectedGameId) return false
    return true
  })

  return (
    <>
      <section style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '16px', color: 'var(--text-muted)', marginBottom: '12px' }}>게임 필터</h2>
        <div style={{ display: 'flex', overflowX: 'auto', gap: '16px', paddingBottom: '8px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <div 
            onClick={() => setSelectedGameId(null)}
            style={{ 
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer', minWidth: '70px',
              opacity: selectedGameId === null ? 1 : 0.5
            }}
          >
            <div style={{ width: '60px', height: '60px', borderRadius: '16px', backgroundColor: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', boxShadow: selectedGameId === null ? '0 0 12px rgba(99,102,241,0.5)' : 'none' }}>
              🌟
            </div>
            <span style={{ fontSize: '12px', fontWeight: selectedGameId === null ? 'bold' : 'normal' }}>전체 보기</span>
          </div>

          {games?.map((g: any) => (
            <div 
              key={g.id} 
              onClick={() => setSelectedGameId(g.id)}
              style={{ 
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer', minWidth: '70px',
                opacity: selectedGameId === g.id ? 1 : 0.5
              }}
            >
              <div style={{ width: '60px', height: '60px', borderRadius: '16px', backgroundColor: 'var(--bg-color)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', border: selectedGameId === g.id ? '2px solid var(--primary-color)' : '2px solid transparent' }}>
                {g.image_url ? (
                  <img src={g.image_url} alt={g.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  '🎲'
                )}
              </div>
              <span style={{ fontSize: '12px', fontWeight: selectedGameId === g.id ? 'bold' : 'normal', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '70px' }}>{g.title}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <h2 style={{ fontSize: '16px', color: 'var(--text-muted)' }}>내 승률 통계</h2>
        {myStats ? (
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginTop: '12px' }}>
            <div style={{ fontSize: '40px', fontWeight: 'bold', color: 'var(--primary-color)' }}>{myStats.rate}<span style={{fontSize:'20px'}}>%</span></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ fontSize: '14px', color: 'var(--success)', fontWeight: 'bold' }}>{myStats.total}전 {myStats.wins}승 {myStats.total - myStats.wins}패</div>
            </div>
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>보유 포인트</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fbbf24' }}>{(myStats.bodong || 0).toLocaleString()} 보동</div>
            </div>
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '12px' }}>해당 게임의 통계가 없습니다.</p>
        )}
      </section>

      <section className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '18px', margin: 0 }}>🏆 명예의 전당</h2>
          {leaderboard.length > 3 && (
            <button onClick={() => setShowFullLeaderboard(true)} style={{ background: 'transparent', border: 'none', color: 'var(--primary-color)', fontSize: '14px', cursor: 'pointer', fontWeight: 'bold' }}>전체보기</button>
          )}
        </div>
        {leaderboard.length > 0 ? (
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {leaderboard.slice(0, 3).map((stat, idx) => (
              <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: idx < Math.min(leaderboard.length, 3) - 1 ? '1px solid var(--border-color)' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '18px', fontWeight: 'bold', color: idx === 0 ? '#fbbf24' : idx === 1 ? '#94a3b8' : idx === 2 ? '#b45309' : 'var(--text-muted)' }}>{idx + 1}</span>
                  <Link href={`/users/${stat.uid}`} style={{ fontWeight: '600', color: 'var(--text-main)', textDecoration: 'none' }}>{stat.name}</Link>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>{stat.rate.toFixed(1)}%</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{stat.total}전 {stat.wins}승 {stat.total - stat.wins}패</div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>해당 게임의 통계가 없습니다.</p>
        )}
      </section>

      <section className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '18px', margin: 0 }}>최근 전적</h2>
        </div>
        {filteredMatches && filteredMatches.length > 0 ? (
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredMatches.map((m: any) => {
              const participantCount = m.match_results?.length || 0;
              const isSolo = participantCount === 1;

              return (
                <li key={m.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(m.date_played).toLocaleString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })} • {m.games?.title || '알 수 없는 게임'} {isSolo && '(솔로 플레이)'}</div>
                    {m.match_results?.some((r: any) => r.user_id === myUserId) && (
                      <button onClick={() => handleDelete(m.id)} disabled={isPending} style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '12px', cursor: isPending ? 'wait' : 'pointer' }}>삭제</button>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {m.match_results?.map((r: any, i: number) => {
                      const Content = (
                        <>
                          {r.is_winner && !isSolo && '👑'} {r.team ? `[${r.team}팀] ` : ''}{r.profiles ? `${r.profiles.display_name}(${r.profiles.username})` : (r.external_name ? `${r.external_name}(외부)` : '알 수 없는 유저')} {r.score !== null && <span style={{ opacity: 0.7 }}>{r.score} 점</span>}
                        </>
                      )
                      const style = { padding: '6px 12px', borderRadius: '20px', backgroundColor: r.is_winner && !isSolo ? 'rgba(16, 185, 129, 0.1)' : 'var(--border-color)', border: `1px solid ${r.is_winner && !isSolo ? 'var(--success)' : 'transparent'}`, fontSize: '14px', color: r.is_winner && !isSolo ? 'var(--success)' : 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }
                      
                      return r.user_id ? (
                        <Link href={`/users/${r.user_id}`} key={i} style={style}>
                          {Content}
                        </Link>
                      ) : (
                        <span key={i} style={style}>
                          {Content}
                        </span>
                      )
                    })}
                  </div>
                </li>
              )
            })}
          </ul>
        ) : (
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>아직 기록된 전적이 없습니다.</p>
        )}
      </section>

      {showFullLeaderboard && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
            <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '18px', margin: 0 }}>🏆 명예의 전당 (전체)</h2>
              <button onClick={() => setShowFullLeaderboard(false)} style={{ background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text-main)', lineHeight: 1 }}>&times;</button>
            </div>
            <div style={{ overflowY: 'auto', padding: '20px' }}>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {leaderboard.map((stat, idx) => (
                  <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: idx < leaderboard.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '18px', fontWeight: 'bold', color: idx === 0 ? '#fbbf24' : idx === 1 ? '#94a3b8' : idx === 2 ? '#b45309' : 'var(--text-muted)' }}>{idx + 1}</span>
                      <Link href={`/users/${stat.uid}`} style={{ fontWeight: '600', color: 'var(--text-main)', textDecoration: 'none' }}>{stat.name}</Link>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>{stat.rate.toFixed(1)}%</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{stat.total}전 {stat.wins}승 {stat.total - stat.wins}패</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

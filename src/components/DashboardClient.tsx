'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { approveMatch, rejectMatch, deleteMatch, cancelMatch } from '@/app/matches/actions'

export default function DashboardClient({ games, matches, pendingMatches, allResults, myUserId, isMaster }: any) {
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null)
  const [showFullLeaderboard, setShowFullLeaderboard] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleApprove = (matchId: string) => {
    startTransition(async () => {
      await approveMatch(matchId)
    })
  }

  const handleReject = (matchId: string) => {
    if (confirm('이 전적 등록을 거절하시겠습니까? 거절 시 전적 등록이 취소됩니다.')) {
      startTransition(async () => {
        await rejectMatch(matchId)
      })
    }
  }

  const handleDelete = (matchId: string) => {
    if (confirm('정말 이 전적을 삭제하시겠습니까? 삭제 시 복구할 수 없습니다.')) {
      startTransition(async () => {
        await deleteMatch(matchId)
      })
    }
  }

  const handleCancel = (matchId: string) => {
    if (confirm('내가 등록한 이 전적을 취소(삭제)하시겠습니까?')) {
      startTransition(async () => {
        await cancelMatch(matchId)
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
  const userStats: Record<string, { name: string, total: number, wins: number, rate: number }> = {}
  filteredResults.forEach((r: any) => {
    const isSolo = participantsPerMatch[r.match_id] === 1
    if (isSolo) return // Skip solo plays

    const uid = r.user_id
    if (!userStats[uid]) {
      userStats[uid] = { uid, name: r.profiles ? `${r.profiles.display_name}(${r.profiles.username})` : '알 수 없는 유저', total: 0, wins: 0, rate: 0, bodong: r.profiles?.bodong || 0 }
    }
    userStats[uid].total += 1
    if (r.is_winner) userStats[uid].wins += 1
  })

  // Calculate rate for all users first
  Object.values(userStats).forEach(stat => {
    stat.rate = stat.total > 0 ? Math.round((stat.wins / stat.total) * 100) : 0;
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

      {pendingMatches && pendingMatches.length > 0 && (
        <section className="card" style={{ border: '2px solid var(--primary-color)' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '16px', color: 'var(--primary-color)' }}>🔔 승인 대기 중인 전적</h2>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {pendingMatches.map((m: any) => {
              const myResult = m.match_results?.find((r: any) => r.user_id === myUserId)
              const needsMyApproval = myResult && myResult.is_approved === false

              return (
              <li key={m.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(m.date_played).toLocaleString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })} • {m.games?.title || '알 수 없는 게임'}</div>
                  {m.creator_id === myUserId && (
                    <button onClick={() => handleCancel(m.id)} disabled={isPending} style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '12px', cursor: isPending ? 'wait' : 'pointer' }}>등록 취소</button>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {m.match_results?.map((r: any, i: number) => (
                    <div key={i} style={{ padding: '6px 12px', borderRadius: '20px', backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', fontSize: '14px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {r.is_winner && '👑'} {r.team ? `[${r.team}팀] ` : ''}{r.profiles ? `${r.profiles.display_name}(${r.profiles.username})` : '알 수 없는 유저'} {r.score !== null && <span style={{ opacity: 0.7 }}>{r.score} 점</span>}
                      {r.is_approved ? <span style={{ fontSize: '10px', color: 'var(--success)', marginLeft: '4px' }}>✓승인완료</span> : <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginLeft: '4px' }}>⏳대기중</span>}
                    </div>
                  ))}
                </div>
                {needsMyApproval ? (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    <button onClick={() => handleApprove(m.id)} disabled={isPending} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--primary-color)', color: 'white', fontWeight: 'bold', cursor: isPending ? 'wait' : 'pointer' }}>수락</button>
                    <button onClick={() => handleReject(m.id)} disabled={isPending} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'transparent', color: 'var(--text-main)', cursor: isPending ? 'wait' : 'pointer' }}>거절</button>
                  </div>
                ) : (
                  <div style={{ fontSize: '12px', color: 'var(--primary-color)', marginTop: '4px', textAlign: 'center', backgroundColor: 'rgba(99,102,241,0.1)', padding: '8px', borderRadius: '8px' }}>
                    ⏳ 다른 참여자들의 승인을 기다리고 있습니다...
                  </div>
                )}
              </li>
              )
            })}
          </ul>
        </section>
      )}

      <section className="card">
        <h2 style={{ fontSize: '16px', color: 'var(--text-muted)' }}>내 승률 통계</h2>
        {myStats ? (
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginTop: '12px' }}>
            <div style={{ fontSize: '40px', fontWeight: 'bold', color: 'var(--primary-color)' }}>{myStats.rate}<span style={{fontSize:'20px'}}>%</span></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ fontSize: '14px' }}>총 {myStats.total}전</div>
              <div style={{ fontSize: '14px', color: 'var(--success)' }}>{myStats.wins}승 {myStats.total - myStats.wins}패</div>
            </div>
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>보유 포인트</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fbbf24' }}>{myStats.bodong.toLocaleString()} 보동</div>
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
                  <div style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>{stat.rate}%</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{stat.wins}승 {stat.total - stat.wins}패</div>
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
                    {isMaster && (
                      <button onClick={() => handleDelete(m.id)} disabled={isPending} style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '12px', cursor: isPending ? 'wait' : 'pointer' }}>삭제</button>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {m.match_results?.map((r: any, i: number) => (
                      <Link href={`/users/${r.user_id}`} key={i} style={{ padding: '6px 12px', borderRadius: '20px', backgroundColor: r.is_winner && !isSolo ? 'rgba(16, 185, 129, 0.1)' : 'var(--border-color)', border: `1px solid ${r.is_winner && !isSolo ? 'var(--success)' : 'transparent'}`, fontSize: '14px', color: r.is_winner && !isSolo ? 'var(--success)' : 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
                        {r.is_winner && !isSolo && '👑'} {r.team ? `[${r.team}팀] ` : ''}{r.profiles ? `${r.profiles.display_name}(${r.profiles.username})` : '알 수 없는 유저'} {r.score !== null && <span style={{ opacity: 0.7 }}>{r.score} 점</span>}
                      </Link>
                    ))}
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
                      <div style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>{stat.rate}%</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{stat.wins}승 {stat.total - stat.wins}패</div>
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

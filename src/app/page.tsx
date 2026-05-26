import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from '@/components/DashboardClient'
import Link from 'next/link'

export default async function Home() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/login')
  }

  const { data: games } = await supabase.from('games').select('*').order('title')
  
  const { data: matches } = await supabase.from('matches').select(`
    id, date_played, created_at,
    games(id, title),
    match_results(
      score, is_winner, user_id, team,
      profiles(display_name, username)
    )
  `).eq('status', 'approved').order('date_played', { ascending: false }).order('created_at', { ascending: false }).limit(20)

  const { data: pendingMatches } = await supabase.from('matches').select(`
    id, date_played, created_at, status, creator_id,
    games(id, title),
    match_results!inner(
      score, is_winner, user_id, team, is_approved,
      profiles(display_name, username)
    )
  `).eq('status', 'pending')
    .eq('match_results.user_id', data.user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  // Since the inner join limits the results array to ONLY the current user's result, 
  // we actually need to fetch the full match_results for these match IDs to display all participants.
  const pendingMatchIds = pendingMatches?.map(m => m.id) || []
  let fullPendingMatches: any[] = []
  
  if (pendingMatchIds.length > 0) {
    const { data: fullMatches } = await supabase.from('matches').select(`
      id, date_played, created_at, status, creator_id,
      games(id, title),
      match_results(
        score, is_winner, user_id, team, is_approved,
        profiles(display_name, username)
      )
    `).in('id', pendingMatchIds).order('created_at', { ascending: false })
    fullPendingMatches = fullMatches || []
  }

  const myPendingMatches = fullPendingMatches

  const { data: allResults } = await supabase.from('match_results').select(`
    match_id, is_winner, user_id,
    profiles(display_name, username, bodong),
    matches!inner(game_id, status)
  `).eq('matches.status', 'approved')

  const { data: myProfile } = await supabase.from('profiles').select('avatar_url, is_master, bodong').eq('id', data.user.id).single()

  return (
    <>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '22px' }}>🎲 대시보드</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/mypage" style={{ display: 'block', width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--bg-color)', overflow: 'hidden', border: '2px solid var(--border-color)' }}>
            {myProfile?.avatar_url ? (
              <img src={myProfile.avatar_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>👤</div>
            )}
          </Link>
          <form action="/auth/signout" method="post" style={{ margin: 0 }}>
            <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '14px', cursor: 'pointer', padding: '8px 0' }}>로그아웃</button>
          </form>
        </div>
      </header>
      
      <DashboardClient games={games || []} matches={matches || []} pendingMatches={myPendingMatches} allResults={allResults || []} myUserId={data.user.id} isMaster={myProfile?.is_master} />
    </>
  )
}

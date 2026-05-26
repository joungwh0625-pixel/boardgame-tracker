'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function recordMatch(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const game_id = formData.get('game_id') as string
  let date_played = formData.get('date_played') as string
  
  // datetime-local doesn't include timezone, so we append Korean time offset (+09:00) 
  // or just let it parse as ISO string with proper timezone if they added seconds
  if (date_played && date_played.length === 16) {
    date_played = date_played + ':00+09:00'
  }
  
  // Calculate if solo to determine initial status
  let numPlayers = 0;
  for (let i = 1; i <= 4; i++) {
    if (formData.get(`player_${i}`)) numPlayers++;
  }
  const isSolo = numPlayers === 1;

  // Create match
  const { data: match, error: matchError } = await supabase.from('matches').insert({
    game_id,
    date_played,
    creator_id: user.id,
    status: isSolo ? 'approved' : 'pending'
  }).select().single()

  if (matchError || !match) {
    console.error('Error creating match', matchError)
    redirect(encodeURI('/matches/new?message=기보 생성에 실패했습니다.'))
  }

  // Create match_results
  const results = []
  
  const playersData = []
  for (let i = 1; i <= 20; i++) {
    const user_id = formData.get(`player_${i}`) as string
    if (!user_id) continue;
    
    const scoreRaw = formData.get(`score_${i}`)
    const score = scoreRaw ? parseInt(scoreRaw as string) : null
    const is_winner = formData.get(`winner_${i}`) === 'true'
    const team = formData.get(`team_${i}`) as string || null

    playersData.push({ user_id, score, is_winner, team })
  }



  for (const p of playersData) {
    results.push({
      match_id: match.id,
      user_id: p.user_id,
      score: p.score,
      is_winner: isSolo ? false : p.is_winner,
      team: p.team,
      is_approved: isSolo || p.user_id === user.id // Creator automatically approves
    })
  }

  if (results.length > 0) {
    const { error: resultsError } = await supabase.from('match_results').insert(results)
    if (resultsError) {
      console.error('Error creating results', resultsError)
      redirect(encodeURI('/matches/new?message=결과 저장에 실패했습니다.'))
    }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

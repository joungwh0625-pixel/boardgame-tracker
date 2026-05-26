'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function approveMatch(matchId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // Update my result to approved
  await supabase.from('match_results')
    .update({ is_approved: true })
    .eq('match_id', matchId)
    .eq('user_id', user.id)

  // Check if everyone has approved now
  const { data: results } = await supabase.from('match_results')
    .select('is_approved')
    .eq('match_id', matchId)

  const allApproved = results?.every(r => r.is_approved === true)

  if (allApproved) {
    await supabase.from('matches')
      .update({ status: 'approved' })
      .eq('id', matchId)

    // Check if multi-player
    if (results && results.length > 1) {
      // Get winners
      const { data: winners } = await supabase.from('match_results').select('user_id').eq('match_id', matchId).eq('is_winner', true)
      
      if (winners && winners.length > 0) {
        // Increment bodong points
        for (const w of winners) {
          const { data: p } = await supabase.from('profiles').select('bodong').eq('id', w.user_id).single()
          await supabase.from('profiles').update({ bodong: (p?.bodong || 0) + 100 }).eq('id', w.user_id)
        }
      }
    }
  }

  revalidatePath('/', 'layout')
}

export async function rejectMatch(matchId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // User is participating in this match, they rejected -> delete the match entirely
  await supabase.from('matches')
    .delete()
    .eq('id', matchId)

  revalidatePath('/', 'layout')
}

export async function deleteMatch(matchId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // Verify master status
  const { data: profile } = await supabase.from('profiles').select('is_master').eq('id', user.id).single()
  
  if (profile?.is_master) {
    // Check if match was approved and multi-player to deduct points
    const { data: match } = await supabase.from('matches').select('status').eq('id', matchId).single()
    const { data: results } = await supabase.from('match_results').select('user_id, is_winner').eq('match_id', matchId)
    
    if (match?.status === 'approved' && results && results.length > 1) {
      const winners = results.filter(r => r.is_winner)
      for (const w of winners) {
        const { data: p } = await supabase.from('profiles').select('bodong').eq('id', w.user_id).single()
        await supabase.from('profiles').update({ bodong: Math.max(0, (p?.bodong || 0) - 100) }).eq('id', w.user_id)
      }
    }

    await supabase.from('matches')
      .delete()
      .eq('id', matchId)
    revalidatePath('/', 'layout')
  }
}

export async function cancelMatch(matchId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // Verify creator status
  const { data: match } = await supabase.from('matches').select('creator_id, status').eq('id', matchId).single()
  
  if (match?.creator_id === user.id && match?.status === 'pending') {
    await supabase.from('matches')
      .delete()
      .eq('id', matchId)
    revalidatePath('/', 'layout')
  }
}

'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteMatch(matchId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // Verify participant status
  const { data: matchResults } = await supabase.from('match_results').select('user_id, is_winner').eq('match_id', matchId)
  
  const isParticipant = matchResults?.some(r => r.user_id === user.id)
  
  if (isParticipant) {
    // Check if multi-player to deduct points
    if (matchResults && matchResults.length > 1) {
      const winners = matchResults.filter(r => r.is_winner)
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

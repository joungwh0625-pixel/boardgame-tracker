import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import MatchForm from '@/components/MatchForm'

export default async function NewMatchPage(props: { searchParams: Promise<{ message: string }> }) {
  const searchParams = await props.searchParams;
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  // Fetch games and users for the dropdowns
  const { data: games } = await supabase.from('games').select('*').order('title')
  const { data: profiles } = await supabase.from('profiles').select('*').order('display_name')

  return <MatchForm games={games || []} profiles={profiles || []} message={searchParams?.message} myUserId={user.id} />
}

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import AdminClient from '@/components/AdminClient'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: user, error: userError } = await supabase.auth.getUser()
  if (userError || !user?.user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('is_master').eq('id', user.user.id).single()
  if (!profile?.is_master) redirect('/') // Only masters can access

  const { data: profiles } = await supabase.from('profiles').select('*').order('display_name')

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '20px', color: 'var(--primary-color)' }}>👑 마스터 권한 관리</h1>
        <Link href="/games/new" style={{ fontSize: '14px', color: 'var(--text-muted)', textDecoration: 'none' }}>&larr; 돌아가기</Link>
      </div>
      
      <AdminClient profiles={profiles || []} />
    </div>
  )
}

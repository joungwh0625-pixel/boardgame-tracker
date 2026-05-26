import { addGame } from './actions'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import GameListClient from '@/components/GameListClient'
import SubmitButton from '@/components/SubmitButton'

export const dynamic = 'force-dynamic'

export default async function NewGamePage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/login')
  }


  const { data: games } = await supabase.from('games').select('*').order('title')

  return (
    <>
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '20px', margin: 0 }}>새 보드게임 등록</h1>
        </div>
        <form action={addGame}>
          <div className="form-group">
            <label htmlFor="title">보드게임 이름</label>
            <input id="title" name="title" type="text" required />
          </div>
          <div className="form-group">
            <label htmlFor="description">설명 (선택)</label>
            <textarea id="description" name="description" rows={3} />
          </div>
          <div className="form-group">
            <label htmlFor="image_file">이미지 첨부 (선택)</label>
            <input id="image_file" name="image_file" type="file" accept="image/*" />
          </div>
          <SubmitButton defaultText="등록하기" pendingText="등록 중..." />
        </form>
      </div>

      <GameListClient games={games || []} isMaster={true} />
    </>
  )
}

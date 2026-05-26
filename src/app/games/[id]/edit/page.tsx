import { updateGame } from './actions'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function EditGamePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const supabase = await createClient()
  const { data: user, error: userError } = await supabase.auth.getUser()
  if (userError || !user?.user) redirect('/login')

  const { data: game, error } = await supabase.from('games').select('*').eq('id', id).single()
  
  if (error || !game) redirect('/games/new')

  return (
    <div className="card">
      <h1 style={{ fontSize: '20px', marginBottom: '24px' }}>보드게임 수정</h1>
      <form action={updateGame}>
        <input type="hidden" name="id" value={game.id} />
        
        <div className="form-group">
          <label htmlFor="title">보드게임 이름</label>
          <input id="title" name="title" type="text" defaultValue={game.title} required />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">설명 (선택)</label>
          <textarea id="description" name="description" rows={3} defaultValue={game.description || ''} />
        </div>
        
        {game.image_url && (
          <div className="form-group">
            <label>현재 이미지</label>
            <div style={{ width: '100px', height: '100px', borderRadius: '12px', overflow: 'hidden' }}>
              <img src={game.image_url} alt="Current image" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="image_file">새로운 이미지 첨부 (선택)</label>
          <input id="image_file" name="image_file" type="file" accept="image/*" />
          <small style={{ color: 'var(--text-muted)' }}>새 이미지를 첨부하면 기존 이미지가 교체됩니다.</small>
        </div>
        
        <button className="btn btn-primary" type="submit">수정 완료</button>
      </form>
    </div>
  )
}

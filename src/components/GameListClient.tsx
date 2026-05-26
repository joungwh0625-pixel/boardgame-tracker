'use client'

import { useState } from 'react'
import Link from 'next/link'
import DeleteGameButton from '@/components/DeleteGameButton'
import { deleteGame } from '@/app/games/new/actions'

export default function GameListClient({ games, isMaster }: { games: any[], isMaster: boolean }) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredGames = games.filter(g => 
    g.title?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="card" style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '18px', margin: 0 }}>등록된 보드게임 목록</h2>
      </div>

      <div className="form-group">
        <input 
          type="text" 
          placeholder="보드게임 이름 검색..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-main)', outline: 'none' }}
        />
      </div>

      {filteredGames && filteredGames.length > 0 ? (
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
          {filteredGames.map((g: any) => (
            <li key={g.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '12px', overflow: 'hidden', backgroundColor: 'var(--bg-color)', flexShrink: 0 }}>
                {g.image_url ? <img src={g.image_url} alt={g.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>🎲</div>}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{g.title}</div>
                {g.description && <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{g.description}</div>}
              </div>
              {isMaster && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Link href={`/games/${g.id}/edit`} style={{ padding: '6px 12px', backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)', fontSize: '12px', textDecoration: 'none' }}>수정</Link>
                  <form action={deleteGame}>
                    <input type="hidden" name="game_id" value={g.id} />
                    <DeleteGameButton />
                  </form>
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '16px', textAlign: 'center' }}>검색된 게임이 없습니다.</p>
      )}
    </div>
  )
}

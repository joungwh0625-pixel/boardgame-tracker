'use client'

import { useState } from 'react'
import { toggleMasterStatus } from '@/app/games/new/actions'

export default function AdminClient({ profiles }: { profiles: any[] }) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredProfiles = profiles.filter(p => 
    p.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.username?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div>
      <div className="form-group">
        <input 
          type="text" 
          placeholder="회원 이름 또는 아이디 검색..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-main)', outline: 'none' }}
        />
      </div>

      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
        {filteredProfiles.map((p: any) => (
          <li key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
            <div>
              <span style={{ fontWeight: 'bold' }}>{p.display_name}</span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '8px' }}>({p.username})</span>
            </div>
            <form action={toggleMasterStatus}>
              <input type="hidden" name="user_id" value={p.id} />
              <input type="hidden" name="current_status" value={p.is_master ? 'true' : 'false'} />
              <button type="submit" style={{ padding: '6px 12px', backgroundColor: p.is_master ? 'var(--primary-color)' : 'var(--bg-color)', border: p.is_master ? 'none' : '1px solid var(--border-color)', borderRadius: '20px', color: p.is_master ? '#fff' : 'var(--text-main)', fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s' }}>
                {p.is_master ? '마스터 해제' : '마스터 부여'}
              </button>
            </form>
          </li>
        ))}
        {filteredProfiles.length === 0 && (
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center' }}>검색 결과가 없습니다.</p>
        )}
      </ul>
    </div>
  )
}

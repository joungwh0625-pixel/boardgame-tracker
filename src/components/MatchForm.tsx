'use client'

import { useState } from 'react'
import { recordMatch } from '@/app/matches/new/actions'

export default function MatchForm({ games, profiles, message }: { games: any[], profiles: any[], message?: string }) {
  const [selectedPlayers, setSelectedPlayers] = useState<Record<number, string>>({})
  const [playerCount, setPlayerCount] = useState(4)

  const handlePlayerChange = (num: number, value: string) => {
    setSelectedPlayers(prev => ({
      ...prev,
      [num]: value
    }))
  }

  const isPlayerSelectedByOther = (profileId: string, currentNum: number) => {
    for (const key in selectedPlayers) {
      if (parseInt(key) !== currentNum && selectedPlayers[key] === profileId) {
        return true
      }
    }
    return false
  }

  const addPlayer = () => {
    if (playerCount < 8) {
      setPlayerCount(prev => prev + 1)
    }
  }

  return (
    <div className="card">
      <h1 style={{ fontSize: '20px', marginBottom: '24px' }}>새 기보 등록</h1>
      {message && (
        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', textAlign: 'center' }}>
          {message}
        </div>
      )}
      <form action={recordMatch}>
        <div className="form-group">
          <label htmlFor="game_id">보드게임 선택</label>
          <select id="game_id" name="game_id" required>
            <option value="">게임을 선택하세요</option>
            {games?.map((g: any) => (
              <option key={g.id} value={g.id}>{g.title}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="date_played">플레이 날짜 및 시간</label>
          <input id="date_played" name="date_played" type="datetime-local" required defaultValue={new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)} />
        </div>

        <div style={{ padding: '16px', backgroundColor: 'var(--bg-color)', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '16px', marginBottom: '16px' }}>참여자 및 결과 (최대 20명)</h2>
          
          {Array.from({ length: playerCount }, (_, i) => i + 1).map(num => (
            <div key={num} style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: num !== playerCount ? '1px solid var(--border-color)' : 'none' }}>
              <div className="form-group">
                <label>참여자 {num} {num === 1 ? '(필수)' : '(선택)'}</label>
                <select 
                  name={`player_${num}`} 
                  required={num === 1}
                  value={selectedPlayers[num] || ''}
                  onChange={(e) => handlePlayerChange(num, e.target.value)}
                >
                  <option value="">{num === 1 ? "선택하세요" : "없음 (선택)"}</option>
                  {profiles?.map((p: any) => (
                    <option 
                      key={p.id} 
                      value={p.id} 
                      disabled={isPlayerSelectedByOther(p.id, num)}
                    >
                      {p.display_name}({p.username}) {isPlayerSelectedByOther(p.id, num) ? '(선택됨)' : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label>팀 (선택)</label>
                  <select name={`team_${num}`}>
                    <option value="">개인전</option>
                    <option value="A">A팀</option>
                    <option value="B">B팀</option>
                    <option value="C">C팀</option>
                    <option value="D">D팀</option>
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label>점수 (선택)</label>
                  <input type="number" name={`score_${num}`} placeholder="0" />
                </div>
                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 0, marginTop: '24px' }}>
                  <input type="checkbox" name={`winner_${num}`} value="true" style={{ width: '20px', height: '20px' }} />
                  <label style={{ margin: 0, fontSize: '14px', color: 'var(--text-main)' }}>승리🏆</label>
                </div>
              </div>
            </div>
          ))}
          
          {playerCount < 20 && (
            <button 
              type="button" 
              onClick={addPlayer}
              style={{ width: '100%', padding: '12px', marginTop: '8px', backgroundColor: 'transparent', border: '1px dashed var(--primary-color)', color: 'var(--primary-color)', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              + 참여자 추가하기 ({playerCount}/20)
            </button>
          )}
        </div>

        <button className="btn btn-primary" type="submit">기보 저장하기</button>
      </form>
    </div>
  )
}

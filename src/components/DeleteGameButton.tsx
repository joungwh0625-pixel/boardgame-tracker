'use client'

export default function DeleteGameButton() {
  return (
    <button 
      type="submit" 
      style={{ padding: '6px 12px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', borderRadius: '8px', color: 'var(--danger)', fontSize: '12px', cursor: 'pointer' }} 
      onClick={(e) => { 
        if(!confirm('정말 삭제하시겠습니까? 관련된 기보 기록도 모두 함께 삭제됩니다.')) {
          e.preventDefault() 
        }
      }}
    >
      삭제
    </button>
  )
}

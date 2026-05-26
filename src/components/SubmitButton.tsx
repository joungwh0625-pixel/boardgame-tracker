'use client'

import { useFormStatus } from 'react-dom'
import { useState, useEffect } from 'react'

export default function SubmitButton({ defaultText = '저장하기', pendingText = '저장 중...' }: { defaultText?: string, pendingText?: string }) {
  const { pending } = useFormStatus()
  const [locked, setLocked] = useState(false)

  useEffect(() => {
    if (pending) {
      setLocked(true)
    }
  }, [pending])

  const isLoading = pending || locked

  return (
    <>
      {isLoading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999
        }}>
          <div className="spinner" style={{ width: '56px', height: '56px', borderWidth: '5px', borderColor: 'rgba(251, 191, 36, 0.3)', borderTopColor: '#fbbf24', marginBottom: '24px' }}></div>
          <div style={{ color: '#fbbf24', fontWeight: 'bold', fontSize: '20px', letterSpacing: '4px', animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
            LOADING...
          </div>
        </div>
      )}
      <button className="btn btn-primary" type="submit" disabled={isLoading} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
        {isLoading && <span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></span>}
        {isLoading ? pendingText : defaultText}
      </button>
    </>
  )
}

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
    <button className="btn btn-primary" type="submit" disabled={isLoading} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
      {isLoading && <span className="spinner"></span>}
      {isLoading ? pendingText : defaultText}
    </button>
  )
}

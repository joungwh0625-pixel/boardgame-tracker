'use client'

import { useFormStatus } from 'react-dom'

export default function SubmitButton({ defaultText = '저장하기', pendingText = '저장 중...' }: { defaultText?: string, pendingText?: string }) {
  const { pending } = useFormStatus()

  return (
    <button className="btn btn-primary" type="submit" disabled={pending}>
      {pending ? pendingText : defaultText}
    </button>
  )
}

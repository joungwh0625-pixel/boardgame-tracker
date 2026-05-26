'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function SocialLogins() {
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const supabase = createClient()

  const handleOAuthLogin = async (provider: 'google') => {
    try {
      setIsLoading(provider)
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      
      if (error) throw error
    } catch (error) {
      console.error(`${provider} login error:`, error)
      alert('소셜 로그인 중 오류가 발생했습니다.')
      setIsLoading(null)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
      <div style={{ position: 'relative', margin: '20px 0', textAlign: 'center' }}>
        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, borderTop: '1px solid var(--border-color)', zIndex: 1 }}></div>
        <span style={{ position: 'relative', background: 'var(--surface-color)', padding: '0 10px', color: 'var(--text-muted)', fontSize: '14px', zIndex: 2 }}>
          또는 소셜 계정으로 계속하기
        </span>
      </div>

      <button
        onClick={() => handleOAuthLogin('google')}
        disabled={isLoading !== null}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          padding: '16px',
          backgroundColor: '#ffffff',
          color: '#3c4043',
          border: '1px solid #dadce0',
          borderRadius: '12px',
          fontSize: '16px',
          fontWeight: 600,
          cursor: isLoading !== null ? 'not-allowed' : 'pointer',
          opacity: isLoading === 'google' ? 0.7 : 1,
          transition: 'all 0.2s',
        }}
      >
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        {isLoading === 'google' ? '구글 로그인 중...' : 'Google로 계속하기'}
      </button>
    </div>
  )
}

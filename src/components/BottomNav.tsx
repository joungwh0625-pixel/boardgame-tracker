'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function BottomNav() {
  const pathname = usePathname()

  // Hide bottom nav on auth pages
  if (pathname === '/login' || pathname === '/signup') return null

  return (
    <nav className="bottom-nav">
      <Link href="/" className={`nav-item ${pathname === '/' ? 'active' : ''}`}>
        <span style={{ fontSize: '24px' }}>🏠</span>
        홈
      </Link>
      <Link href="/matches/new" className={`nav-item ${pathname === '/matches/new' ? 'active' : ''}`}>
        <span style={{ fontSize: '24px' }}>✍️</span>
        승패기록
      </Link>
      <Link href="/ranking" className={`nav-item ${pathname === '/ranking' ? 'active' : ''}`}>
        <span style={{ fontSize: '24px' }}>🏆</span>
        랭킹
      </Link>
      <Link href="/games/new" className={`nav-item ${pathname === '/games/new' ? 'active' : ''}`}>
        <span style={{ fontSize: '24px' }}>🎲</span>
        게임추가
      </Link>
    </nav>
  )
}

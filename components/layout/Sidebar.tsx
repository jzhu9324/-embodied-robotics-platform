'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

const bdNav = [
  { href: '/dashboard', label: '总览' },
  { href: '/tech-tree', label: '科技树' },
  { href: '/partners', label: '合作方库' },
  { href: '/demands', label: '需求管理' },
  { href: '/my-demands', label: '我的需求' },
  { href: '/admin', label: '后台管理' },
]

const rdNav = [
  { href: '/tech-tree', label: '科技树' },
  { href: '/portal', label: '提出需求' },
  { href: '/my-demands', label: '我的需求' },
]

export function Sidebar({ role }: { role: 'BD' | 'RD' }) {
  const pathname = usePathname()
  const nav = role === 'BD' ? bdNav : rdNav

  return (
    <aside className="w-[220px] bg-[#1c1c1e] text-white flex flex-col shrink-0 h-screen sticky top-0">
      <div className="px-5 py-6 border-b border-[#2c2c2e]">
        <h1 className="text-[13px] font-semibold leading-snug">具身机器人<br />技术交流平台</h1>
      </div>
      <nav className="flex-1 py-3">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2 px-5 py-[9px] text-[13px] transition-colors
              ${pathname === item.href
                ? 'bg-[#2c2c2e] text-white'
                : 'text-[#aeaeb2] hover:bg-[#2c2c2e] hover:text-white'
              }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="px-5 py-4 border-t border-[#2c2c2e]">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2 h-2 rounded-full bg-green-400"></span>
          <span className="text-xs text-[#aeaeb2]">{role === 'BD' ? 'BD 管理员' : '研发人员'}</span>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="text-xs text-[#636366] hover:text-white transition-colors"
        >
          退出登录
        </button>
      </div>
    </aside>
  )
}

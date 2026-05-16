'use client'
// components/Sidebar.tsx
// Sidebar con navegación condicional según rol.
// Recibe `role` como prop desde un Server Component (layout o page).
//
// Usuario  → solo ve "Inicio" (buyer app)
// Admin    → ve "Inicio" + "Transferencias"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useTheme } from '@/lib/theme'
import ThemeToggle from '@/components/ThemeToggle'

interface SidebarProps {
  role: 'admin' | 'user'
  /** URL de la buyer app. Cuando se integre con la app de tu compañera,
   *  pasá la URL real. Por ahora apunta al mock local. */
  buyerAppUrl?: string
}

interface NavItem {
  href:  string
  label: string
  icon:  string
  external?: boolean
}

export default function Sidebar({ role, buyerAppUrl = '/' }: SidebarProps) {
  const pathname      = usePathname()
  const { resolved }  = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const userItems: NavItem[] = [
    { href: buyerAppUrl, label: 'Inicio', icon: '🏠', external: buyerAppUrl.startsWith('http') },
  ]

  const adminItems: NavItem[] = [
    { href: buyerAppUrl,              label: 'Inicio',          icon: '🏠', external: buyerAppUrl.startsWith('http') },
    { href: '/admin/transferencias',  label: 'Transferencias',  icon: '💸' },
  ]

  const items = role === 'admin' ? adminItems : userItems

  return (
    <aside
      className="flex flex-col h-screen w-60 shrink-0 border-r px-4 py-6 gap-6"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor:     'var(--color-border)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-2">
        <img
          src={!mounted || resolved === 'light'
            ? '/logos/zapasya-light.png'
            : '/logos/zapasya-dark.png'
          }
          alt="ZapasYa"
          className="h-8 w-auto"
        />
        <span className="text-xs font-normal" style={{ color: 'var(--color-muted)' }}>
          · Payments
        </span>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 flex-1">
        {/* Badge de rol */}
        <div className="px-3 mb-2">
          <span
            className="text-xs font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: role === 'admin' ? 'var(--color-info-light)' : 'var(--color-muted-light)',
              color:           role === 'admin' ? 'var(--color-info)'       : 'var(--color-muted)',
            }}
          >
            {role === 'admin' ? '⚡ Admin' : '👤 Usuario'}
          </span>
        </div>

        {items.map((item) => {
          const isActive = !item.external && pathname === item.href
          const Tag      = item.external ? 'a' : Link

          return (
            <Tag
              key={item.href}
              href={item.href}
              {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all"
              style={{
                backgroundColor: isActive ? 'var(--color-info-light)' : 'transparent',
                color:           isActive ? 'var(--color-info)'       : 'var(--color-foreground)',
              }}
            >
              <span>{item.icon}</span>
              {item.label}
            </Tag>
          )
        })}
      </nav>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-2 pt-4 border-t"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <span className="text-xs" style={{ color: 'var(--color-muted)' }}>Tema</span>
        <ThemeToggle />
      </div>
    </aside>
  )
}
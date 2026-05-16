'use client'
// components/Sidebar.tsx
// Sidebar colapsable con botón hamburguesa ☰.
// - Cerrado: solo muestra íconos (64px de ancho)
// - Abierto:  muestra íconos + labels (224px de ancho)
// - Posición: fixed, altura 100vh

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useTheme } from '@/lib/theme'

interface SidebarProps {
  role:         'admin' | 'user'
  buyerAppUrl?: string
}

interface NavItem {
  href:      string
  label:     string
  icon:      string
  external?: boolean
}

export default function Sidebar({ role, buyerAppUrl = '/' }: SidebarProps) {
  const pathname              = usePathname()
  const { resolved }          = useTheme()
  const [mounted, setMounted] = useState(false)
  const [open, setOpen]       = useState(false)

  useEffect(() => setMounted(true), [])

  const userItems: NavItem[] = [
    { href: buyerAppUrl, label: 'Inicio', icon: '🏠', external: buyerAppUrl.startsWith('http') },
  ]

  const adminItems: NavItem[] = [
    { href: buyerAppUrl,             label: 'Inicio',         icon: '🏠', external: buyerAppUrl.startsWith('http') },
    { href: '/admin/transferencias', label: 'Transferencias', icon: '💸' },
  ]

  const items = role === 'admin' ? adminItems : userItems

  return (
    <>
      {/* Overlay — cierra el sidebar al tocar fuera */}
      {open && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 20 }}
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        style={{
          position:        'fixed',
          top:             0,
          left:            0,
          height:          '100vh',
          width:           open ? '224px' : '64px',
          zIndex:          30,
          backgroundColor: 'var(--color-surface)',
          borderRight:     '1px solid var(--color-border)',
          display:         'flex',
          flexDirection:   'column',
          transition:      'width 0.2s ease',
          overflow:        'hidden',
        }}
      >

        {/* Header: hamburguesa + logo */}
        <div style={{
          display:      'flex',
          alignItems:   'center',
          gap:          '10px',
          padding:      '12px',
          minHeight:    '64px',
          borderBottom: '1px solid var(--color-border)',
        }}>
          <button
            onClick={() => setOpen(o => !o)}
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            style={{
              flexShrink:      0,
              width:           '40px',
              height:          '40px',
              borderRadius:    '10px',
              border:          '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface-alt)',
              color:           'var(--color-foreground)',
              fontSize:        '18px',
              cursor:          'pointer',
              display:         'flex',
              alignItems:      'center',
              justifyContent:  'center',
            }}
          >
            {open ? '✕' : '☰'}
          </button>

          <div style={{
            opacity:    open ? 1 : 0,
            width:      open ? 'auto' : 0,
            overflow:   'hidden',
            whiteSpace: 'nowrap',
            transition: 'opacity 0.15s ease',
          }}>
            <img
              src={!mounted || resolved === 'light'
                ? '/logos/zapasya-light.png'
                : '/logos/zapasya-dark.png'}
              alt="ZapasYa"
              style={{ height: '40px', width: 'auto' }}
            />
          </div>
        </div>

        {/* Badge de rol */}
        <div style={{ padding: '12px 12px 4px' }}>
          <span style={{
            display:         'inline-flex',
            alignItems:      'center',
            gap:             '4px',
            fontSize:        '11px',
            fontWeight:      600,
            textTransform:   'uppercase',
            letterSpacing:   '0.08em',
            padding:         '2px 8px',
            borderRadius:    '999px',
            whiteSpace:      'nowrap',
            overflow:        'hidden',
            maxWidth:        open ? '160px' : '40px',
            transition:      'max-width 0.2s ease',
            backgroundColor: role === 'admin' ? 'var(--color-info-light)' : 'var(--color-muted-light)',
            color:           role === 'admin' ? 'var(--color-info)'       : 'var(--color-muted)',
          }}>
            {role === 'admin' ? '⚡' : '👤'}
            <span style={{ opacity: open ? 1 : 0, transition: 'opacity 0.15s ease' }}>
              {role === 'admin' ? 'Admin' : 'Usuario'}
            </span>
          </span>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', padding: '8px' }}>
          {items.map((item) => {
            const isActive = !item.external && pathname === item.href
            const Tag      = item.external ? 'a' : Link

            return (
              <Tag
                key={item.href}
                href={item.href}
                {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                onClick={() => setOpen(false)}
                style={{
                  display:         'flex',
                  alignItems:      'center',
                  gap:             '12px',
                  borderRadius:    '10px',
                  padding:         '10px',
                  fontSize:        '14px',
                  fontWeight:      500,
                  textDecoration:  'none',
                  whiteSpace:      'nowrap',
                  overflow:        'hidden',
                  backgroundColor: isActive ? 'var(--color-info-light)' : 'transparent',
                  color:           isActive ? 'var(--color-info)'       : 'var(--color-foreground)',
                  transition:      'background-color 0.15s ease',
                }}
              >
                <span style={{ fontSize: '18px', flexShrink: 0 }}>{item.icon}</span>
                <span style={{ opacity: open ? 1 : 0, transition: 'opacity 0.15s ease' }}>
                  {item.label}
                </span>
              </Tag>
            )
          })}
        </nav>

      </aside>
    </>
  )
}
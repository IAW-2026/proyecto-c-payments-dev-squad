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
import ThemeToggle from '@/components/ThemeToggle'
import { UserButton } from '@clerk/nextjs'

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
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Detectar mobile al montar y en cambios de ventana
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const userItems: NavItem[] = [
    { href: buyerAppUrl, label: 'Inicio', icon: '🏠', external: buyerAppUrl.startsWith('http') },
  ]

  const adminItems: NavItem[] = [
    { href: '/admin/dashboard',      label: 'Dashboard',      icon: '📊' },
    { href: '/admin/transferencias', label: 'Transferencias', icon: '💸' },
    { href: '/admin/disputas',       label: 'Disputas',       icon: '⚠️' },
  ]

  const items = role === 'admin' ? adminItems : userItems

  const btnStyle = {
    width:           '44px',
    height:          '44px',
    borderRadius:    '10px',
    border:          '1px solid var(--color-border)',
    backgroundColor: 'var(--color-surface-alt)',
    color:           'var(--color-foreground)',
    fontSize:        '20px',
    cursor:          'pointer',
    display:         'flex',
    alignItems:      'center',
    justifyContent:  'center',
    flexShrink:      0,
  }

  return (
    <>
      {/* Botón hamburguesa fijo en mobile (siempre visible) */}
      {isMobile && (
        <button
          onClick={() => setOpen(o => !o)}
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          style={{
            ...btnStyle,
            position: 'fixed',
            top:      '12px',
            left:     '12px',
            zIndex:   40,
          }}
        >
          {open ? '✕' : '☰'}
        </button>
      )}

      {/* Overlay — cierra el sidebar al tocar fuera (solo visible en mobile) */}
      {open && isMobile && (
        <div
          style={{ 
            position: 'fixed', 
            inset: 0, 
            zIndex: 20,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            animation: 'fadeIn 0.2s ease-out',
          }}
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        style={{
          position:        'fixed',
          top:             0,
          left:            0,
          height:          '100vh',
          width:           isMobile ? '260px' : (open ? '224px' : '64px'),
          zIndex:          30,
          backgroundColor: 'var(--color-surface)',
          borderRight:     isMobile ? 'none' : '1px solid var(--color-border)',
          display:         'flex',
          flexDirection:   'column',
          transition:      'transform 0.25s ease, width 0.3s ease',
          transform:       isMobile ? (open ? 'translateX(0)' : 'translateX(-110%)') : 'none',
          overflow:        'hidden',
          boxShadow:       isMobile && open ? '0 14px 50px rgba(0,0,0,0.18)' : 'none',
          borderRadius:    isMobile ? '0 20px 20px 0' : '0',
          pointerEvents:   isMobile && !open ? 'none' : 'auto',
        }}
      >

        {/* Header: hamburguesa + logo */}
        <div style={{
          display:      'flex',
          alignItems:   'center',
          gap:          '10px',
          padding:      '12px',
          minHeight:    isMobile ? 'auto' : '64px',
          borderBottom: isMobile && !open ? 'none' : '1px solid var(--color-border)',
        }}>
          {!isMobile && (
            <button
              onClick={() => setOpen(o => !o)}
              aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
              style={btnStyle}
            >
              {open ? '✕' : '☰'}
            </button>
          )}

          <div style={{
            opacity:    open ? 1 : 0,
            width:      open ? 'auto' : 0,
            overflow:   'hidden',
            whiteSpace: 'nowrap',
            transition: 'opacity 0.15s ease',
          }}>
            <img
              src={!mounted || resolved === 'light'
                ? '/logos/zapasya-light.webp'
                : '/logos/zapasya-dark.webp'}
              alt="ZapasYa"
              style={{ height: '32px', width: 'auto', cursor: 'pointer' }}
              onClick={() => {
                const audio = new Audio('/easter-egg.mp3')
                audio.volume = 0.5
                audio.play().catch(() => {})
              }}
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

        {/* Footer */}
        <div style={{
          padding:    '12px',
          borderTop:  '1px solid var(--color-border)',
          display:    'flex',
          alignItems: 'center',
          gap:        '10px',
          overflow:   'hidden',
        }}>
          <ThemeToggle />
          <span style={{
            fontSize:   '12px',
            color:      'var(--color-muted)',
            opacity:    open ? 1 : 0,
            whiteSpace: 'nowrap',
            transition: 'opacity 0.15s ease',
          }}>
            Cambiar tema
          </span>
        </div>

        {/* Usuario */}
        <div style={{
          padding:    '12px',
          borderTop:  '1px solid var(--color-border)',
          display:    'flex',
          alignItems: 'center',
          gap:        '10px',
          overflow:   'hidden',
        }}>
          <UserButton />
          <span style={{
            fontSize:   '12px',
            color:      'var(--color-muted)',
            opacity:    open ? 1 : 0,
            whiteSpace: 'nowrap',
            transition: 'opacity 0.15s ease',
          }}>
            Mi cuenta
          </span>
        </div>

      </aside>
    </>
  )
}
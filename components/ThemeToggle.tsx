'use client'
// components/ThemeToggle.tsx
import { useEffect, useState } from 'react'
import { useTheme } from '@/lib/theme'

export default function ThemeToggle() {
  const { resolved, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  // Render un placeholder del mismo tamaño para no causar layout shift
  if (!mounted) {
    return (
      <span
        style={{ width: '36px', height: '36px', display: 'inline-block' }}
      />
    )
  }

  return (
    <button
      onClick={() => setTheme(resolved === 'dark' ? 'light' : 'dark')}
      aria-label={resolved === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      className="rounded-full border flex items-center justify-center transition-all"
      style={{
        width:           '36px',
        height:          '36px',
        borderColor:     'var(--color-border)',
        backgroundColor: 'var(--color-surface-alt)',
        color:           'var(--color-foreground)',
        fontSize:        '16px',
      }}
    >
      {resolved === 'dark' ? '☀️' : '🌙'}
    </button>
  )
}
'use client'
// components/ThemeToggle.tsx
// Botón de toggle light/dark para el navbar.
// Uso: <ThemeToggle />
import { useTheme } from '@/lib/theme'

export default function ThemeToggle() {
  const { resolved, setTheme } = useTheme()

  function toggle() {
    setTheme(resolved === 'dark' ? 'light' : 'dark')
  }

  return (
    <button
      onClick={toggle}
      aria-label={resolved === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      className="rounded-full border flex items-center justify-center transition-all"
      style={{
        width:           '54px',
        height:          '54px',
        borderColor:     'var(--color-border)',
        backgroundColor: 'var(--color-surface-alt)',
        color:           'var(--color-foreground)',
        fontSize:        '20px',
      }}
    >
      {resolved === 'dark' ? '☀️' : '🌙'}
    </button>
  )
}
'use client'
// lib/theme.tsx
import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextValue {
  theme:    Theme
  resolved: 'light' | 'dark'
  setTheme: (t: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme:    'system',
  resolved: 'light',
  setTheme: () => {},
})

function getInitialTheme(): Theme {
  // Solo se ejecuta en el cliente
  try {
    const saved = localStorage.getItem('theme') as Theme | null
    if (saved === 'light' || saved === 'dark' || saved === 'system') return saved
  } catch {}
  return 'system'
}

function resolveTheme(theme: Theme): 'light' | 'dark' {
  if (theme !== 'system') return theme
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Arrancamos con 'system' para el SSR — se corrige inmediatamente en el cliente
  const [theme, setThemeState] = useState<Theme>('system')
  // resolved arranca leyendo el data-theme que el script inline ya puso en el DOM,
  // así el primer render del cliente coincide con el servidor.
  const [resolved, setResolved] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light'
    const attr = document.documentElement.getAttribute('data-theme')
    return attr === 'dark' ? 'dark' : 'light'
  })

  // Carga la preferencia guardada al montar (solo cliente)
  useEffect(() => {
    const initial = getInitialTheme()
    setThemeState(initial)
    const r = resolveTheme(initial)
    setResolved(r)
    document.documentElement.setAttribute('data-theme', r)
  }, [])

  // Aplica cambios cuando el usuario cambia el tema
  useEffect(() => {
    const r = resolveTheme(theme)
    setResolved(r)
    document.documentElement.setAttribute('data-theme', r)
    try { localStorage.setItem('theme', theme) } catch {}
  }, [theme])

  // Escucha cambios del OS en modo system
  useEffect(() => {
    if (theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => {
      const r = e.matches ? 'dark' : 'light'
      setResolved(r)
      document.documentElement.setAttribute('data-theme', r)
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme])

  function setTheme(t: Theme) {
    setThemeState(t)
  }

  return (
    <ThemeContext.Provider value={{ theme, resolved, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
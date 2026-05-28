// app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs'
import { ThemeProvider } from '@/lib/theme'
import { getRole } from '@/lib/auth'
import Sidebar from '@/components/Sidebar'
import './globals.css'

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Lee el rol server-side — si no hay sesión activa devuelve 'user'
  const role = await getRole()

  return (
    <ClerkProvider>
      <html lang="es" suppressHydrationWarning>
        <head>
        </head>
        <body>
          <ThemeProvider>
            <div style={{ backgroundColor: 'var(--color-background)', minHeight: '100vh' }}>
              <Sidebar role={role} />
              {/* paddingLeft = ancho del sidebar colapsado (64px) */}
              <main style={{ paddingLeft: '64px', minHeight: '100vh' }}>
                {children}
              </main>
            </div>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
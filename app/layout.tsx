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
          <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
        </head>
        <body>
          <ThemeProvider>
            <div style={{ backgroundColor: 'var(--color-background)', minHeight: '100vh' }}>
              <Sidebar role={role} />
              {/* paddingLeft responsive: 0 en mobile, 64px en desktop */}
              <main style={{ minHeight: '100vh' }} className="md:pl-16">
                {children}
              </main>
            </div>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
// app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs'
import { ThemeProvider } from '@/lib/theme'
import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="es" suppressHydrationWarning>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
        </head>
        <body>
          <ThemeProvider>
            <div style={{ backgroundColor: 'var(--color-background)', minHeight: '100vh' }}>
              <main style={{ minHeight: '100vh' }}>
                {children}
              </main>
            </div>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
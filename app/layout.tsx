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
      {/*
        suppressHydrationWarning evita el warning de React cuando el script
        de abajo modifica data-theme antes de que hidrate el cliente.
      */}
      <html lang="es" suppressHydrationWarning>
        <head>
          {/*
            Script inline: se ejecuta ANTES del primer paint.
            Evita el flash de tema incorrecto (FOUC).
          */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  try {
                    var saved = localStorage.getItem('theme');
                    var preferred = saved === 'dark' || saved === 'light'
                      ? saved
                      : window.matchMedia('(prefers-color-scheme: dark)').matches
                        ? 'dark'
                        : 'light';
                    document.documentElement.setAttribute('data-theme', preferred);
                  } catch(e) {}
                })();
              `,
            }}
          />
        </head>
        <body>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
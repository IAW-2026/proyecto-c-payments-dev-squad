'use client'
import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <main
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, var(--color-border) 1px, transparent 0)`,
          backgroundSize: '32px 32px',
          opacity: 0.4,
        }}
      />

      <div className="relative flex flex-col items-center gap-6">
        <div className="text-center">
          <span className="text-2xl font-black" style={{ color: 'var(--color-foreground)' }}>
            ZapasYa
          </span>
          <span className="text-sm ml-2" style={{ color: 'var(--color-muted)' }}>· Payments</span>
        </div>

        <SignUp
          appearance={{
            variables: {
              colorPrimary: '#000000',
              colorBackground: '#ffffff',
              colorText: '#171717',
              colorTextSecondary: '#6b7280',
              colorInputBackground: '#f8fafc',
              colorInputText: '#171717',
              borderRadius: '1rem',
              fontFamily: 'inherit',
            },
            elements: {
              card: {
                boxShadow: '0 24px 80px rgba(0,0,0,0.08)',
                border: '1px solid #d1d5db',
                borderRadius: '1.5rem',
                padding: '2rem',
              },
              headerTitle: {
                fontSize: '1.5rem',
                fontWeight: '900',
              },
              formButtonPrimary: {
                backgroundColor: '#000000',
                borderRadius: '1rem',
                fontWeight: '800',
              },
              formFieldInput: {
                borderRadius: '1rem',
                border: '1px solid #d1d5db',
              },
              footerActionLink: {
                color: '#000000',
                fontWeight: '600',
              },
            },
          }}
        />
      </div>
    </main>
  )
}
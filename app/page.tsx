'use client'
import { useUser, SignInButton, UserButton } from '@clerk/nextjs'
import { useState } from 'react'

export default function Home() {
  const { isSignedIn } = useUser()
  const [selectedPayment, setSelectedPayment] = useState<string | null>('mercadopago')

  const paymentMethods = [
    {
      id: 'mercadopago',
      icon: '💳',
      title: 'Mercado Pago',
      subtitle: 'Saldo, tarjeta o cuotas',
    },
    {
      id: 'credit',
      icon: '🏦',
      title: 'Tarjeta de crédito',
      subtitle: 'Visa, Mastercard, Amex',
    },
    {
      id: 'transfer',
      icon: '🏛️',
      title: 'Transferencia bancaria',
      subtitle: 'Acreditación en 1-2 días',
    },
  ]

  return (
    <main className="min-h-screen py-8 px-4" style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-foreground)' }}>
      <div className="mx-auto max-w-5xl">

        {/* Nav */}
        <nav
          className="flex items-center justify-between mb-8 rounded-2xl px-6 py-4 border"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <span className="text-lg font-black" style={{ color: 'var(--color-foreground)' }}>
            ZapasYa <span className="font-normal text-sm" style={{ color: 'var(--color-muted)' }}>· Payments</span>
          </span>
          {isSignedIn ? (
            <UserButton />
          ) : (
            <SignInButton>
              <button className="flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold border btn-secondary" style={{ borderColor: 'var(--color-border)' }}>
                <span>👤</span> Iniciar sesión
              </button>
            </SignInButton>
          )}
        </nav>

        {/* Badge + Title */}
        <div className="mb-6">
          <span
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest mb-4"
            style={{ backgroundColor: 'var(--color-success-light)', color: 'var(--color-success)' }}
          >
            <span className="h-2 w-2 rounded-full inline-block" style={{ backgroundColor: 'var(--color-success)' }} />
            Compra segura
          </span>
          <h1 className="text-3xl font-black" style={{ color: 'var(--color-foreground)' }}>Confirmá tu pago</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-muted)' }}>Revisá los detalles y elegí cómo querés pagar.</p>
        </div>

        {/* Main grid */}
        <div className="grid gap-6 lg:grid-cols-[1fr_420px]">

          {/* LEFT COLUMN */}
          <div className="flex flex-col gap-6">

            {/* Producto */}
            <section
              className="rounded-2xl p-6 border"
              style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              <p className="text-xs font-semibold uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: 'var(--color-muted)' }}>
                <span>📦</span> Producto
              </p>
              <div className="flex gap-4 items-start">
                <div className="rounded-xl overflow-hidden shrink-0 border" style={{ borderColor: 'var(--color-border)' }}>
                  <img
                    src="https://images.unsplash.com/photo-1600185360814-bae279f266f7?auto=format&fit=crop&w=200&q=80"
                    alt="Zapatillas UltraSprint"
                    className="w-24 h-24 object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-base" style={{ color: 'var(--color-foreground)' }}>Zapatillas UltraSprint</p>
                  <p className="text-sm mt-0.5" style={{ color: 'var(--color-muted)' }}>Edición limitada · Talle 42</p>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    <span
                      className="rounded-full px-3 py-1 text-xs font-semibold"
                      style={{ backgroundColor: 'var(--color-muted-light)', color: 'var(--color-muted)' }}
                    >Running</span>
                    <span
                      className="rounded-full px-3 py-1 text-xs font-semibold"
                      style={{ backgroundColor: 'var(--color-muted-light)', color: 'var(--color-muted)' }}
                    >Envío 24h</span>
                  </div>
                  <p className="text-xs mt-3" style={{ color: 'var(--color-muted)' }}>6 meses garantía</p>
                </div>
              </div>
            </section>

            {/* Resumen */}
            <section
              className="rounded-2xl p-6 border"
              style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              <p className="text-xs font-semibold uppercase tracking-widest mb-5 flex items-center gap-2" style={{ color: 'var(--color-muted)' }}>
                <span>🧾</span> Resumen
              </p>
              <div className="flex flex-col gap-3 text-sm">
                <div className="flex justify-between">
                  <span style={{ color: 'var(--color-muted)' }}>Producto</span>
                  <span style={{ color: 'var(--color-foreground)' }}>$ 18.999</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--color-muted)' }}>Envío</span>
                  <span style={{ color: 'var(--color-success)' }}>Gratis</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--color-muted)' }}>Descuento</span>
                  <span style={{ color: 'var(--color-success)' }}>– $ 1.900</span>
                </div>
                <div
                  className="flex justify-between font-black text-base pt-4 mt-1 border-t"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-foreground)' }}
                >
                  <span>Total</span>
                  <span>$ 17.099</span>
                </div>
              </div>
            </section>

            {/* Info pills */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Cuotas', value: '12x $1.425', sub: null },
                { label: 'Interés', value: 'Sin Interés', highlight: true },
                { label: 'Entrega', value: '24 h', sub: null },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl p-4 text-center border"
                  style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
                >
                  <p className="text-xs mb-1" style={{ color: 'var(--color-muted)' }}>{item.label}</p>
                  <p
                    className="font-black text-sm"
                    style={{ color: item.highlight ? 'var(--color-success)' : 'var(--color-foreground)' }}
                  >
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN — Método de pago */}
          <aside
            className="rounded-2xl p-6 border h-fit"
            style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest mb-5 flex items-center gap-2" style={{ color: 'var(--color-muted)' }}>
              <span>💰</span> Método de Pago
            </p>

            <div className="flex flex-col gap-3">
              {paymentMethods.map((method) => {
                const isSelected = selectedPayment === method.id
                return (
                  <button
                    key={method.id}
                    onClick={() => setSelectedPayment(method.id)}
                    className="flex items-center justify-between rounded-2xl px-4 py-4 border text-left transition-all"
                    style={{
                      backgroundColor: isSelected ? 'var(--color-info-light)' : 'var(--color-surface-alt)',
                      borderColor: isSelected ? 'var(--color-info)' : 'var(--color-border)',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{method.icon}</span>
                      <div>
                        <p className="font-semibold text-sm" style={{ color: 'var(--color-foreground)' }}>{method.title}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>{method.subtitle}</p>
                      </div>
                    </div>
                    <span
                      className="h-4 w-4 rounded-full border-2 shrink-0"
                      style={{
                        borderColor: isSelected ? 'var(--color-info)' : 'var(--color-border)',
                        backgroundColor: isSelected ? 'var(--color-info)' : 'transparent',
                      }}
                    />
                  </button>
                )
              })}
            </div>

            {/* CTA */}
            <button
              className="mt-6 w-full rounded-2xl py-4 font-black text-base flex items-center justify-center gap-2 transition-all btn-primary"
              style={{ letterSpacing: '-0.01em' }}
            >
              🔒 Pagar $ 17.099
            </button>

            {/* Disclaimer */}
            <div
              className="mt-4 rounded-2xl p-4 text-xs flex items-start gap-2"
              style={{ backgroundColor: 'var(--color-info-light)', color: 'var(--color-info-dark)' }}
            >
              <span className="mt-0.5">ℹ️</span>
              <span>Vas a ser redirigido a MercadoPago para completar el pago de forma segura.</span>
            </div>
          </aside>

        </div>
      </div>
    </main>
  )
}
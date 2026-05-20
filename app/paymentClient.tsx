'use client'
// app/paymentClient.tsx
import { useUser, SignInButton, UserButton } from '@clerk/nextjs'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ThemeToggle from '@/components/ThemeToggle'
import { useTheme } from '@/lib/theme'

interface OrderItem {
  name:     string
  price:    number
  quantity: number
  size:     number
  color:    string | null
  imageUrl: string | null
}

interface Order {
  id:       string
  total:    number
  discount: number
  shipping: number
  status:   string
  address:  string
  carrier:  'MAIL' | 'PICKUP'
  items:    OrderItem[]
}

interface Props {
  orderId: string
  userId:  string
  order:   Order
}

export default function PaymentClient({ orderId, userId, order }: Props) {
  const { isSignedIn }        = useUser()
  const router                = useRouter()
  const { resolved }          = useTheme()
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [selectedPayment, setSelectedPayment] = useState('mercadopago')

  useEffect(() => setMounted(true), [])

  const firstItem = order.items[0]
  const subtotal  = order.items.reduce((acc, i) => acc + i.price * i.quantity, 0)

  async function handlePagar() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/payments', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ orderId, userId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error al iniciar el pago')
      if (data.init_point) {
        window.location.href = data.init_point
      } else {
        router.push(`/pago/exitoso?order_id=${orderId}`)
      }
    } catch (e: any) {
      setError(e.message ?? 'Ocurrió un error inesperado')
    } finally {
      setLoading(false)
    }
  }

  const paymentMethods = [
    { id: 'mercadopago', icon: '💳', title: 'Mercado Pago', subtitle: 'Saldo, tarjeta o cuotas' },
  ]

  return (
    <main
      className="min-h-screen py-8 px-4"
      style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-foreground)' }}
    >
      <div className="mx-auto max-w-5xl">

        {/* Nav */}
        <nav
          className="flex items-center justify-between mb-8 rounded-2xl px-6 py-4 border"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center gap-3">
            <img
              src={!mounted || resolved === 'light'
                ? '/logos/zapasya-light.png'
                : '/logos/zapasya-dark.png'}
              alt="ZapasYa"
              className="h-10 w-auto"
            />
            <span className="text-sm font-normal" style={{ color: 'var(--color-muted)' }}>
              · Payments
            </span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {isSignedIn ? (
              <UserButton />
            ) : (
              <SignInButton>
                <button
                  className="flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold border btn-secondary"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <span>👤</span> Iniciar sesión
                </button>
              </SignInButton>
            )}
          </div>
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
          <h1 className="text-3xl font-black" style={{ color: 'var(--color-foreground)' }}>
            Confirmá tu pago
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-muted)' }}>
            Revisá los detalles y elegí cómo querés pagar.
          </p>
        </div>

        {/* Main grid */}
        <div className="grid gap-6 lg:grid-cols-[1fr_420px]">

          {/* LEFT */}
          <div className="flex flex-col gap-6">

            {/* Productos */}
            <section
              className="rounded-2xl p-6 border"
              style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              <p className="text-xs font-semibold uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: 'var(--color-muted)' }}>
                <span>📦</span> Producto{order.items.length > 1 ? 's' : ''}
              </p>

              <div className="flex flex-col gap-4">
                {order.items.map((item, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    {/* Imagen */}
                    <div className="rounded-xl overflow-hidden shrink-0 border" style={{ borderColor: 'var(--color-border)' }}>
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-24 h-24 object-cover" />
                      ) : (
                        <div className="w-24 h-24 flex items-center justify-center text-3xl" style={{ backgroundColor: 'var(--color-muted-light)' }}>
                          👟
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <p className="font-bold text-base" style={{ color: 'var(--color-foreground)' }}>
                        {item.name}
                      </p>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: 'var(--color-muted-light)', color: 'var(--color-muted)' }}>
                          Talle {item.size}
                        </span>
                        {item.color && (
                          <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: 'var(--color-muted-light)', color: 'var(--color-muted)' }}>
                            {item.color}
                          </span>
                        )}
                        {item.quantity > 1 && (
                          <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: 'var(--color-muted-light)', color: 'var(--color-muted)' }}>
                            x{item.quantity}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-semibold mt-2" style={{ color: 'var(--color-foreground)' }}>
                        $ {(item.price * item.quantity).toLocaleString('es-AR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Dirección y envío */}
              <div className="mt-4 pt-4 border-t flex items-center gap-2 text-xs" style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}>
                <span>{order.carrier === 'MAIL' ? '🚚' : '🏪'}</span>
                <span>
                  {order.carrier === 'MAIL'
                    ? `Envío a: ${order.address}`
                    : 'Retiro en tienda'}
                </span>
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
                  <span style={{ color: 'var(--color-muted)' }}>Subtotal</span>
                  <span style={{ color: 'var(--color-foreground)' }}>$ {subtotal.toLocaleString('es-AR')}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--color-muted)' }}>Envío</span>
                  {order.shipping === 0
                    ? <span style={{ color: 'var(--color-success)' }}>Gratis</span>
                    : <span style={{ color: 'var(--color-foreground)' }}>$ {order.shipping.toLocaleString('es-AR')}</span>
                  }
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--color-muted)' }}>Descuento</span>
                    <span style={{ color: 'var(--color-success)' }}>– $ {order.discount.toLocaleString('es-AR')}</span>
                  </div>
                )}
                <div
                  className="flex justify-between font-black text-base pt-4 mt-1 border-t"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-foreground)' }}
                >
                  <span>Total</span>
                  <span>$ {order.total.toLocaleString('es-AR')}</span>
                </div>
              </div>
            </section>

            {/* Info pills */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Cuotas',  value: `12x $${Math.ceil(order.total / 12).toLocaleString('es-AR')}`, highlight: false },
                { label: 'Interés', value: 'Sin Interés', highlight: true },
                { label: 'Entrega', value: order.carrier === 'MAIL' ? '24-48 h' : 'Retiro', highlight: false },
              ].map(item => (
                <div
                  key={item.label}
                  className="rounded-2xl p-4 text-center border"
                  style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
                >
                  <p className="text-xs mb-1" style={{ color: 'var(--color-muted)' }}>{item.label}</p>
                  <p className="font-black text-sm" style={{ color: item.highlight ? 'var(--color-success)' : 'var(--color-foreground)' }}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — Método de pago */}
          <aside
            className="rounded-2xl p-6 border h-fit"
            style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest mb-5 flex items-center gap-2" style={{ color: 'var(--color-muted)' }}>
              <span>💰</span> Método de Pago
            </p>

            <div className="flex flex-col gap-3">
              {paymentMethods.map(method => {
                const isSelected = selectedPayment === method.id
                return (
                  <button
                    key={method.id}
                    onClick={() => setSelectedPayment(method.id)}
                    className="flex items-center justify-between rounded-2xl px-4 py-4 border text-left transition-all"
                    style={{
                      backgroundColor: isSelected ? 'var(--color-info-light)' : 'var(--color-surface-alt)',
                      borderColor:     isSelected ? 'var(--color-info)'        : 'var(--color-border)',
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
                        borderColor:     isSelected ? 'var(--color-info)' : 'var(--color-border)',
                        backgroundColor: isSelected ? 'var(--color-info)' : 'transparent',
                      }}
                    />
                  </button>
                )
              })}
            </div>

            {error && (
              <p className="mt-4 text-sm text-center rounded-xl px-3 py-2"
                style={{ color: 'var(--color-error, #dc2626)', backgroundColor: 'var(--color-error-light, #fef2f2)' }}>
                ⚠️ {error}
              </p>
            )}

            <button
              onClick={handlePagar}
              disabled={loading}
              className="mt-6 w-full rounded-2xl py-4 font-black text-base flex items-center justify-center gap-2 transition-all btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ letterSpacing: '-0.01em' }}
            >
              {loading
                ? <><span className="animate-spin inline-block">⏳</span> Procesando...</>
                : <>🔒 Pagar $ {order.total.toLocaleString('es-AR')}</>
              }
            </button>

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
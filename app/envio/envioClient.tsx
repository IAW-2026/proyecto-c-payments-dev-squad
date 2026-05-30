import Link from 'next/link'
import { getShipment, getTracking } from '@/lib/services/shippingApp'

interface EnvioClientProps {
  orderId: string
}

export default async function EnvioClient({ orderId }: EnvioClientProps) {
  const shipment = await getShipment(orderId)
  const tracking = await getTracking(orderId)

  return (
    <main className="min-h-screen px-4 py-8" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="mx-auto max-w-3xl rounded-3xl border p-6 sm:p-8" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        <div className="flex flex-col gap-4 sm:gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] mb-2" style={{ color: 'var(--color-muted)' }}>🚚 Envío</p>
            <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--color-foreground)' }}>
              Seguimiento de envío
            </h1>
            <p className="text-sm sm:text-base mt-2" style={{ color: 'var(--color-muted)' }}>
              Esta es una vista de prueba que utiliza el mock de envío. Más adelante será reemplazada por la app de tu compañero.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border p-4" style={{ backgroundColor: 'var(--color-surface-alt)', borderColor: 'var(--color-border)' }}>
              <p className="text-xs uppercase tracking-[0.16em] mb-2" style={{ color: 'var(--color-muted)' }}>Estado</p>
              <p className="font-black text-base" style={{ color: 'var(--color-foreground)' }}>{shipment.status.replace('_', ' ')}</p>
            </div>
            <div className="rounded-2xl border p-4" style={{ backgroundColor: 'var(--color-surface-alt)', borderColor: 'var(--color-border)' }}>
              <p className="text-xs uppercase tracking-[0.16em] mb-2" style={{ color: 'var(--color-muted)' }}>Entrega estimada</p>
              <p className="font-black text-base" style={{ color: 'var(--color-foreground)' }}>{shipment.estimatedDelivery ?? 'Por confirmar'}</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border p-4" style={{ backgroundColor: 'var(--color-surface-alt)', borderColor: 'var(--color-border)' }}>
              <p className="text-xs uppercase tracking-[0.16em] mb-2" style={{ color: 'var(--color-muted)' }}>ID de envío</p>
              <p className="font-semibold text-sm" style={{ color: 'var(--color-foreground)' }}>{shipment.id}</p>
            </div>
            <div className="rounded-2xl border p-4" style={{ backgroundColor: 'var(--color-surface-alt)', borderColor: 'var(--color-border)' }}>
              <p className="text-xs uppercase tracking-[0.16em] mb-2" style={{ color: 'var(--color-muted)' }}>Carrier</p>
              <p className="font-semibold text-sm" style={{ color: 'var(--color-foreground)' }}>{shipment.carrier}</p>
            </div>
            <div className="rounded-2xl border p-4" style={{ backgroundColor: 'var(--color-surface-alt)', borderColor: 'var(--color-border)' }}>
              <p className="text-xs uppercase tracking-[0.16em] mb-2" style={{ color: 'var(--color-muted)' }}>Dirección</p>
              <p className="font-semibold text-sm" style={{ color: 'var(--color-foreground)' }}>{shipment.address}</p>
            </div>
          </div>

          <section className="rounded-3xl border p-4 sm:p-6" style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)' }}>
            <div className="mb-4">
              <p className="text-xs uppercase tracking-[0.16em]" style={{ color: 'var(--color-muted)' }}>Historial de seguimiento</p>
            </div>
            <div className="space-y-3">
              {tracking.map(event => (
                <div key={event.id} className="rounded-2xl border p-4" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <span className="font-semibold" style={{ color: 'var(--color-foreground)' }}>{event.status.replace('_', ' ')}</span>
                    <span className="text-[11px]" style={{ color: 'var(--color-muted)' }}>{new Date(event.timestamp).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })}</span>
                  </div>
                  <p className="text-sm" style={{ color: 'var(--color-muted)' }}>{event.description}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            <Link
              href="/"
              className="rounded-lg px-4 py-3 text-sm font-semibold text-center"
              style={{ backgroundColor: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', color: 'var(--color-foreground)' }}
            >
              Volver al inicio
            </Link>
            <Link
              href="/pago/exitoso"
              className="rounded-lg px-4 py-3 text-sm font-semibold text-center"
              style={{ backgroundColor: 'var(--color-info)', color: 'white' }}
            >
              Volver a pago exitoso
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

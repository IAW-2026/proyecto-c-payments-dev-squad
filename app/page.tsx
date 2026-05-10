'use client'
import { useUser, SignInButton, UserButton } from '@clerk/nextjs'

export default function Home() {
  const { isSignedIn } = useUser()

  return (
    <main className="payment-page bg-black text-white min-h-screen py-10">
      <div className="page-container mx-auto max-w-6xl px-6">

        <nav className="flex items-center justify-between mb-8 rounded-[20px] bg-gray-900 px-6 py-4 shadow-sm border border-gray-800">
          <span className="text-xl font-black text-white">
            ZapasYa <span className="text-gray-400 font-normal text-sm">· Payments</span>
          </span>
          {isSignedIn ? (
            <UserButton />
          ) : (
            <SignInButton>
              <button className="btn-primary rounded-full px-5 py-2 text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700">
                Iniciar sesión
              </button>
            </SignInButton>
          )}
        </nav>
        {/*CLERK*/}
        <section className="hero grid gap-8 rounded-[26px] bg-gray-900 p-8 shadow-[0_24px_80px_rgba(0,0,0,0.5)] md:grid-cols-[1.2fr_0.8fr] lg:p-12 border border-gray-800">
          <div className="hero-copy flex flex-col justify-center gap-6">
            <span className="hero-badge inline-flex rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] bg-yellow-400 text-black">
              Compra segura
            </span>
            <h1 className="text-4xl font-black leading-tight text-white sm:text-5xl">
              Paga tus zapatillas favoritas con estilo Mercado Libre
            </h1>
            <p className="max-w-2xl text-lg text-gray-300">
              Selecciona tu producto, revisa tu carrito y confirma el pago rápido con cuotas y envío exprés. Todo pensado para una experiencia clara, segura y moderna.
            </p>
            <div className="hero-actions flex flex-wrap gap-3">
              <a href="/pago/pendiente" className="btn-primary rounded-full px-7 py-3 text-base font-semibold shadow-[0_10px_30px_rgba(52,131,250,0.24)] bg-blue-600 text-white hover:bg-blue-700">
                Pagar ahora
              </a>
              <a href="#resumen" className="btn-secondary rounded-full px-7 py-3 text-base font-semibold bg-gray-800 text-white border border-gray-600 hover:bg-gray-700">
                Ver resumen
              </a>
            </div>
            <div className="quick-info grid gap-3 sm:grid-cols-3">
              <div className="info-card rounded-3xl border border-gray-700 bg-gray-800 p-4 text-sm text-gray-300">
                Envío gratis en 24h
              </div>
              <div className="info-card rounded-3xl border border-gray-700 bg-gray-800 p-4 text-sm text-gray-300">
                12 cuotas sin interés
              </div>
              <div className="info-card rounded-3xl border border-gray-700 bg-gray-800 p-4 text-sm text-gray-300">
                Compra protegida
              </div>
            </div>
          </div>

          <article className="product-card rounded-[28px] bg-gray-800 p-6 sm:p-8 border border-gray-700">
            <div className="product-badge mb-5 inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-2 text-sm font-semibold text-blue-900">
              <span className="h-2 w-2 rounded-full bg-blue-600" /> Zapatillas Running
            </div>
            <div className="product-grid grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
              <div className="product-image overflow-hidden rounded-3xl bg-gray-700 p-3 shadow-sm">
                <img src="https://images.unsplash.com/photo-1600185360814-bae279f266f7?auto=format&fit=crop&w=600&q=80" alt="Zapatillas deportivas" className="h-44 w-full object-cover rounded-2xl" />
              </div>
              <div className="product-details">
                <p className="text-sm uppercase tracking-[0.18em] text-gray-400">Edición limitada</p>
                <h2 className="mt-3 text-2xl font-bold text-white">Zapatillas UltraSprint</h2>
                <p className="mt-3 text-sm leading-6 text-gray-300">
                  Comodidad premium para correr y para el día a día. Suela liviana y diseño urbano inspirado en las mejores marcas.
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <span className="price text-3xl font-black text-white">$ 18.999</span>
                  <span className="tag rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-900">
                    12x $1.583 sin interés
                  </span>
                </div>
              </div>
            </div>
            <div className="product-meta mt-8 grid gap-3 text-sm text-gray-300">
              <div className="meta-item flex items-center justify-between rounded-3xl bg-gray-700 px-4 py-4 shadow-sm border border-gray-600">
                <span>Stock</span>
                <strong className="text-green-400">Disponible</strong>
              </div>
              <div className="meta-item flex items-center justify-between rounded-3xl bg-gray-700 px-4 py-4 shadow-sm border border-gray-600">
                <span>Envío</span>
                <strong className="text-green-400">24h</strong>
              </div>
              <div className="meta-item flex items-center justify-between rounded-3xl bg-gray-700 px-4 py-4 shadow-sm border border-gray-600">
                <span>Garantía</span>
                <strong className="text-green-400">6 meses</strong>
              </div>
            </div>
          </article>
        </section>

        <section id="resumen" className="mt-10 grid gap-8 lg:grid-cols-[0.9fr_0.7fr]">
          <div className="card rounded-[28px] bg-gray-900 p-8 shadow-[0_24px_80px_rgba(0,0,0,0.5)] border border-gray-800">
            <h3 className="text-xl font-bold text-white">Resumen de pago</h3>
            <p className="mt-3 text-sm leading-6 text-gray-300">
              Revisa los detalles de tu compra antes de confirmar. Puedes elegir el método de pago y ver el monto total de forma clara y segura.
            </p>
            <div className="mt-8 grid gap-4">
              <div className="summary-row flex items-center justify-between rounded-3xl bg-gray-800 px-5 py-4 border border-gray-700">
                <span className="text-gray-300">Producto</span>
                <strong className="text-white">$ 18.999</strong>
              </div>
              <div className="summary-row flex items-center justify-between rounded-3xl bg-gray-800 px-5 py-4 border border-gray-700">
                <span className="text-gray-300">Envío</span>
                <strong className="text-green-400">Gratis</strong>
              </div>
              <div className="summary-row flex items-center justify-between rounded-3xl bg-gray-800 px-5 py-4 border border-gray-700">
                <span className="text-gray-300">Descuento</span>
                <strong className="text-green-400">-$ 1.900</strong>
              </div>
              <div className="summary-total mt-4 rounded-[24px] bg-gray-800 p-5 text-lg font-semibold text-white border border-gray-700">
                Total a pagar <span className="float-right text-2xl text-blue-400">$ 17.099</span>
              </div>
            </div>
          </div>

          <aside className="card rounded-[28px] bg-gray-900 p-8 shadow-[0_24px_80px_rgba(0,0,0,0.5)] border border-gray-800">
            <h3 className="text-xl font-bold text-white">Método de pago</h3>
            <div className="mt-6 grid gap-4">
              <div className="payment-option rounded-[24px] border border-gray-700 bg-gray-800 p-5 hover:bg-gray-700 transition-colors">
                <p className="font-semibold text-white">Tarjeta de crédito</p>
                <p className="mt-2 text-sm text-gray-300">Visa, Mastercard, American Express.</p>
              </div>
              <div className="payment-option rounded-[24px] border border-gray-700 bg-gray-800 p-5 hover:bg-gray-700 transition-colors">
                <p className="font-semibold text-white">Mercado Pago</p>
                <p className="mt-2 text-sm text-gray-300">Paga con saldo o en cuotas de hasta 12 pagos.</p>
              </div>
              <div className="payment-option rounded-[24px] border border-gray-700 bg-gray-800 p-5 hover:bg-gray-700 transition-colors">
                <p className="font-semibold text-white">Transferencia bancaria</p>
                <p className="mt-2 text-sm text-gray-300">Recepción en 1-2 días hábiles.</p>
              </div>
            </div>
            <div className="mt-8 rounded-[26px] bg-yellow-400 p-5 text-sm text-black">
              <strong className="block mb-2">Consejo:</strong>
              Elige Mercado Pago para aprovechar cuotas sin interés y mayor seguridad en la compra.
            </div>
          </aside>
        </section>
      </div>
    </main>
  )
}

[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/Ks7Ywtwc)
# payments

Aplicación **Payments** del [Proyecto IAW 2026](https://iaw-2026.github.io/proyecto/) — comisión `<!-- completar -->`.

Esta app corresponde al módulo de pagos en los proyectos de tipo **A (Transporte)**, **B (Delivery)** y **C (Marketplace)**.

---

Enunciado completo: <https://iaw-2026.github.io/proyecto/>

El flujo de MP es:
MP llama → webhook
  → actualiza estado en DB
  → crea Transaccion
  → avisa a Seller App (POST /sales)
  → avisa a Shipping App (POST /shipments)

## 🚀 Deploy en Vercel

### Variables de entorno requeridas

Configurar en Vercel las siguientes variables de entorno:

```bash
# MercadoPago
MP_ACCESS_TOKEN=TEST-xxxxxxxxxxxxx

# URLs de las otras apps (después del deploy)
BUYER_APP_URL=https://tu-buyer-app.vercel.app
SELLER_APP_URL=https://tu-seller-app.vercel.app
SHIPPING_APP_URL=https://tu-shipping-app.vercel.app

# URL de este proyecto
NEXT_PUBLIC_URL=https://tu-payments-app.vercel.app

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Base de datos (PostgreSQL)
DATABASE_URL=postgresql://username:password@host:port/database
```

### Pasos para el deploy

1. **Configurar base de datos**: Crear una base de datos PostgreSQL (Neon, Supabase, etc.)
2. **Configurar MercadoPago**: Obtener access token de test
3. **Configurar Clerk**: Crear aplicación en Clerk y obtener las keys
4. **Deploy en Vercel**: Conectar el repo y configurar las variables de entorno
5. **Actualizar URLs**: Una vez desplegado, actualizar las URLs en las otras apps

## 🛠️ Desarrollo local

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local

# Ejecutar Prisma migrations
npx prisma migrate dev

# Ejecutar en desarrollo
npm run dev
```

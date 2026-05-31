[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/Ks7Ywtwc)

# 💳 Payments App

Aplicación de gestión de pagos del [Proyecto IAW 2026](https://iaw-2026.github.io/proyecto/). Procesa transacciones con MercadoPago, gestiona disputas y coordina con los módulos de Vendedor y Envíos. Incluye panel de administración y autenticación con Clerk.

## 🔗 Deploy

**[Abrir app](https://proyecto-c-payments-dev-squad.vercel.app/**

## 👥 Acceso

### Administrador
- Crear usuario en Clerk Dashboard con `publicMetadata: { "role": "admin" }`
- Accede a `/admin/dashboard`, `/admin/transferencias`, `/admin/disputas`

### Usuario final
- Cualquier usuario registrado en Clerk sin rol asignado
- Accede al checkout de pago desde la Buyer App

## 🛠️ Desarrollo local

```bash
npm install
cp .env.example .env.local  # completar credenciales
npx prisma migrate dev
npm run dev
```

Variables requeridas en `.env`: `MP_ACCESS_TOKEN`, `DATABASE_URL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `NEXT_PUBLIC_URL`, `BUYER_APP_URL`, `SELLER_APP_URL`, `SHIPPING_APP_URL`, `ORS_API_KEY`.
// app/admin/transferencias/page.tsx
// Vista de transferencias para admins.
// Por ahora usa datos del mock — cuando se integre con la DB real,
// reemplazar las funciones mock por queries a prisma.transaccion / prisma.pago.
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/auth'
import TransferenciasClient from './transferenciasClient'

export default async function TransferenciasPage() {
  // Protección server-side: si no es admin, manda al inicio
  if (!(await isAdmin())) {
    redirect('/')
  }

  return <TransferenciasClient />
}
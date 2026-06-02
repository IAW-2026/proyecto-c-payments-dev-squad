// app/admin/disputas/page.tsx
import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { isAdmin } from '@/lib/auth'
import DisputasClient from './disputasClient'

export default async function DisputasPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')
  if (!(await isAdmin())) redirect('/')
  return <DisputasClient />
}
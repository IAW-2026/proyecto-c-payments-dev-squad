// app/admin/dashboard/page.tsx
import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { isAdmin } from '@/lib/auth'
import DashboardClient from './dashboardClient'

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')
  if (!(await isAdmin())) redirect('/')
  return <DashboardClient />
}
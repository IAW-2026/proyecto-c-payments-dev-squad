// lib/auth.ts
// Helper para leer el rol del usuario desde Clerk publicMetadata.
//
// Para asignar rol admin desde Clerk Dashboard:
//   Users → seleccioná el usuario → Public Metadata → { "role": "admin" }
//
// O desde el backend con el SDK de Clerk:
//   await clerkClient.users.updateUserMetadata(userId, {
//     publicMetadata: { role: 'admin' }
//   })

import { currentUser } from '@clerk/nextjs/server'

export type UserRole = 'admin' | 'user'

export async function getRole(): Promise<UserRole> {
  try {
    const user = await currentUser()
    if (!user) return 'user'
    return user.publicMetadata?.role === 'admin' ? 'admin' : 'user'
  } catch {
    return 'user'
  }
}

export async function isAdmin(): Promise<boolean> {
  return (await getRole()) === 'admin'
}
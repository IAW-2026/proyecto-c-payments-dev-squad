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

import { auth, currentUser } from '@clerk/nextjs/server'

export type UserRole = 'admin' | 'user'

/**
 * Server-side: devuelve el rol del usuario autenticado.
 * Usalo en Server Components y route handlers.
 */
export async function getRole(): Promise<UserRole> {
  const user = await currentUser()
  const role = user?.publicMetadata?.role
  return role === 'admin' ? 'admin' : 'user'
}

/**
 * Server-side: devuelve true si el usuario es admin.
 */
export async function isAdmin(): Promise<boolean> {
  return (await getRole()) === 'admin'
}
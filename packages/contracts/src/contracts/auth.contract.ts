import * as z from 'zod'

export const userRole = z.enum(['USER', 'OFFICER', 'ADMIN', 'SUPER_ADMIN'])

export type UserRole = z.infer<typeof userRole>

export type User = {
  id: string
  email: string
  role: UserRole
  name: string
  image?: string
}

import { AuditAction } from '@prisma/client'

export type AuditLogParams = {
  action: AuditAction
  metadata: Record<string, any>
  response: Record<string, any>
  userDeviceInfo: Record<string, any>
  ipAddress?: string
  userId: string
}

import { AuditAction } from '@prisma/client'

export type AuditLogParams = {
  action: AuditAction
  metadata: Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any
  response: Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any
  userDeviceInfo: Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any
  ipAddress?: string
  userId: string
}

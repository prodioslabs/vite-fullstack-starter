import { AuditAction } from '@prisma/client'
import { SetMetadata } from '@nestjs/common'

export const AUDIT_LOG_ACTION = 'AUDIT_LOG_ACTION'

export function AuditLogAction(action: AuditAction) {
  return SetMetadata(AUDIT_LOG_ACTION, action)
}

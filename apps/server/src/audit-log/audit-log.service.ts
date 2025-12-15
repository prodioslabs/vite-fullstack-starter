import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { AuditLogParams } from './audit-log.types'

@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  log(data: AuditLogParams) {
    return this.prisma.auditLog.create({
      data: {
        action: data.action,
        metadata: data.metadata,
        userDeviceInfo: data.userDeviceInfo,
        ipAddress: data.ipAddress,
        user: { connect: { id: data.userId } },
      },
    })
  }

  async updateLog(id: string, data: Partial<AuditLogParams>) {
    return this.prisma.auditLog.update({
      where: { id },
      data,
    })
  }
}

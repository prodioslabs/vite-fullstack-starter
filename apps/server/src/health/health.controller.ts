import { Controller, Get } from '@nestjs/common'
import { HealthCheckService, HealthCheck, PrismaHealthIndicator } from '@nestjs/terminus'
import { PrismaService } from '../prisma/prisma.service'

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prismaHealth: PrismaHealthIndicator,
    private prisma: PrismaService,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([async () => this.prismaHealth.pingCheck('prisma', this.prisma)])
  }
}

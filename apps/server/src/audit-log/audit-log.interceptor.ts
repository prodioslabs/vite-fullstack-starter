import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  InternalServerErrorException,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import * as DeviceDetector from 'device-detector-js'
import { tap } from 'rxjs/operators'
import { Reflector } from '@nestjs/core'
import { AuditAction } from '@prisma/client'
import { AuditLogService } from './audit-log.service'
import { AUDIT_LOG_ACTION } from './audit-log.decorator'

const deviceDetector = new DeviceDetector()

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(
    private readonly auditService: AuditLogService,
    private readonly reflector: Reflector,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest()
    const user = request.user
    const userAgent = request.headers['user-agent']
    const device = deviceDetector.parse(userAgent)

    const action = this.reflector.get<AuditAction>(AUDIT_LOG_ACTION, context.getHandler())
    if (!action) {
      throw new InternalServerErrorException('No action provided for audit log')
    }

    const requestMetadata = {
      body: request.body,
      query: request.query,
      params: request.params,
    }

    const log = await this.auditService.log({
      action,
      metadata: requestMetadata,
      userDeviceInfo: device,
      response: {},
      ipAddress: request.ip,
      userId: user.id,
    })

    return next.handle().pipe(
      tap(async (body) => {
        if (typeof body !== 'function') {
          await this.auditService.updateLog(log.id, {
            response: {
              body,
              status: context.switchToHttp().getResponse().statusCode,
            },
          })
        }
      }),
    )
  }
}

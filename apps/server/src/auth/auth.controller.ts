import { Controller, Req, UseGuards, UseInterceptors } from '@nestjs/common'
import { Request } from 'express'
import { contract } from '@repo/contract'
import { TsRestHandler, tsRestHandler } from '@ts-rest/nest'
import { AuthService } from './auth.service'
import { LocalAuthGuard } from './local.auth.guard'
import { User } from './auth.decorator'
import { UserWithoutSensitiveData } from '../user/user.type'
import { AuditLogInterceptor } from '../audit-log/audit-log.interceptor'
import { AuditLogAction } from '../audit-log/audit-log.decorator'

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLogAction('LOGIN')
  @TsRestHandler(contract.auth.login)
  login(@User() user: UserWithoutSensitiveData) {
    return tsRestHandler(contract.auth.login, async () => {
      return {
        status: 200,
        body: { user },
      }
    })
  }

  @TsRestHandler(contract.auth.signup)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLogAction('LOGOUT')
  signup(@Req() request: Request) {
    return tsRestHandler(contract.auth.signup, async ({ body }) => {
      return this.authService.signup(body, request)
    })
  }

  @TsRestHandler(contract.auth.logout)
  logout(@Req() request: Request) {
    return tsRestHandler(contract.auth.logout, async () => {
      return this.authService.logout(request)
    })
  }
}

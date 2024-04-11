import { Controller, Req, UseGuards } from '@nestjs/common'
import { Request } from 'express'
import { contract } from '@repo/contract'
import { TsRestHandler, tsRestHandler } from '@ts-rest/nest'
import { AuthService } from './auth.service'
import { LocalAuthGuard } from './local.auth.guard'
import { User } from './auth.decorator'
import { UserWithoutSensitiveData } from '../user/user.type'

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @TsRestHandler(contract.auth.login)
  login(@User() user: UserWithoutSensitiveData) {
    return tsRestHandler(contract.auth.login, async () => {
      return {
        status: 201,
        body: user,
      }
    })
  }

  @TsRestHandler(contract.auth.signup)
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

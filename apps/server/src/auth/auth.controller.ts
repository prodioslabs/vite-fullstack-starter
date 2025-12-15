import { Controller, Req, UseGuards } from '@nestjs/common'
import { Request } from 'express'
import { contract } from '@repo/contract'
import { TsRestHandler } from '@ts-rest/nest'
import { AuthService } from './auth.service'
import { LocalAuthGuard } from './local.auth.guard'
import { User } from './auth.decorator'
import { UserWithoutSensitiveData } from '../user/user.type'

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @TsRestHandler(contract.auth.login)
  async login(@User() user: UserWithoutSensitiveData) {
    return {
      status: 200 as const,
      body: { user },
    }
  }

  @TsRestHandler(contract.auth.signup)
  async signup(@Req() request: Request) {
    const body = request.body
    return await this.authService.signup(body, request)
  }

  @TsRestHandler(contract.auth.logout)
  async logout(@Req() request: Request) {
    return await this.authService.logout(request)
  }
}

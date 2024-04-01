import { Controller } from '@nestjs/common'
import { contract } from '@repo/contract'
import { TsRestHandler, tsRestHandler } from '@ts-rest/nest'
import { AuthService } from './auth.service'

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @TsRestHandler(contract.auth.login)
  login() {
    return tsRestHandler(contract.auth.login, async ({ body }) => {
      return this.authService.login(body)
    })
  }

  @TsRestHandler(contract.auth.signup)
  signup() {
    return tsRestHandler(contract.auth.signup, async ({ body }) => {
      return this.authService.signup(body)
    })
  }
}

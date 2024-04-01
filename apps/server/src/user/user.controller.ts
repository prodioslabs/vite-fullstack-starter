import { TsRestHandler, tsRestHandler } from '@ts-rest/nest'
import { Controller, UseGuards } from '@nestjs/common'
import { contract } from '@repo/contract'
import { JwtGuard } from '../auth/jwt.guard'
import { User } from '../auth/auth.decorator'
import { UserWithoutSensitiveData } from './user.type'

@Controller()
export class UserController {
  @UseGuards(JwtGuard)
  @TsRestHandler(contract.user.getCurrentUser)
  getCurrentUser(@User() user: UserWithoutSensitiveData) {
    return tsRestHandler(contract.user.getCurrentUser, async () => {
      return {
        status: 200,
        body: user,
      }
    })
  }
}

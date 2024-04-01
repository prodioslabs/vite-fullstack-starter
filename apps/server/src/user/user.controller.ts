import { TsRestHandler, tsRestHandler } from '@ts-rest/nest'
import { Controller } from '@nestjs/common'
import { contract } from '@repo/contract'

@Controller()
export class UserController {
  @TsRestHandler(contract.user.getCurrentUser)
  getCurrentUser() {
    return tsRestHandler(contract.user.getCurrentUser, async () => {
      return {
        status: 200,
        body: {
          name: 'Abinash',
          email: 'abinash@prodios.com',
        },
      }
    })
  }
}

import { TsRestHandler, tsRestHandler } from '@ts-rest/nest'
import { Controller } from '@nestjs/common'
import { contract } from '@repo/contract'

@Controller()
export class UserController {
  @TsRestHandler(contract.user.getCurerentUser)
  getUser() {
    return tsRestHandler(contract.user.getCurerentUser, async () => {
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

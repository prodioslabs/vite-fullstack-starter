import { TsRestHandler, tsRestHandler } from '@ts-rest/nest'
import { Controller } from '@nestjs/common'
import { contract } from '@repo/contract'

@Controller('user')
export class UserController {
  @TsRestHandler(contract.user.getCurerentUser)
  async getUser() {
    return tsRestHandler(contract.user.getCurerentUser, async () => {
      return {
        status: 200,
        body: {
          name: 'John Doe',
        },
      }
    })
  }
}

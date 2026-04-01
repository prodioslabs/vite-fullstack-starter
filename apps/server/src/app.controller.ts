import { Controller } from '@nestjs/common'
import { Implement, implement } from '@orpc/nest'
import { contract } from '@repo/contracts'
import { AllowAnonymous } from '@thallesp/nestjs-better-auth'

import { AppService } from './app.service'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  @AllowAnonymous()
  @Implement(contract.helloWorld)
  handleRequest() {
    return implement(contract.helloWorld).handler(async ({ input }) => {
      return this.appService.helloWorld(input?.message)
    })
  }
}

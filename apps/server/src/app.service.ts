import { Injectable } from '@nestjs/common'

@Injectable()
export class AppService {
  async helloWorld(message?: string) {
    return { reply: `Hello ${message ?? 'World'}` }
  }
}

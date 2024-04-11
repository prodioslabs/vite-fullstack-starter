import { PassportSerializer } from '@nestjs/passport'
import { BadRequestException, Injectable } from '@nestjs/common'
import { SessionService } from './session.service'

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private readonly sessionService: SessionService) {
    super()
  }

  serializeUser(user: any, done: CallableFunction): void {
    done(null, user)
  }

  async deserializeUser(user: any, done: CallableFunction): Promise<any> {
    const sessionToken = await this.sessionService.findSession(user.sessionId)
    if (!sessionToken) {
      return done(new BadRequestException('Invalid session token'))
    }
    done(null, { ...user, token: sessionToken })
  }
}

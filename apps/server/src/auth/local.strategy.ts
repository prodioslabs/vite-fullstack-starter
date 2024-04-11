import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-local'
import { SessionPayload } from './auth.type'
import { AuthService } from './auth.service'
import { UserWithoutSensitiveData } from '../user/user.type'

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super()
  }

  async validate(payload: SessionPayload): Promise<UserWithoutSensitiveData> {
    return await this.authService.validatePayload(payload)
  }
}

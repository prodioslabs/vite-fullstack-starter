import { Injectable } from '@nestjs/common'
import { Strategy, ExtractJwt } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { ConfigService } from '@nestjs/config'
import { JwtPayload } from './auth.type'
import { AuthService } from './auth.service'
import { UserWithoutSensitiveData } from '../user/user.type'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    })
  }

  async validate(payload: JwtPayload): Promise<UserWithoutSensitiveData> {
    return this.authService.validatePayload(payload)
  }
}

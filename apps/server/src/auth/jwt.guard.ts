import { Injectable, UnauthorizedException } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

@Injectable()
export class JwtGuard extends AuthGuard('jwt') {
  handleRequest(error, user) {
    if (error || !user) {
      throw error || new UnauthorizedException()
    }
    return user
  }
}

import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { UserRole } from '@prisma/client'
import { UserWithoutSensitiveData } from '../user/user.type'
import { AUTHORIZATION_KEY } from './auth.decorator'

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const userRolesAllowed = this.reflector.get<UserRole | UserRole[]>(AUTHORIZATION_KEY, context.getHandler())
    const user = context.switchToHttp().getRequest().user as UserWithoutSensitiveData | undefined

    if (!user) {
      throw Error('AuthorizationGuard is used with using JWTGuard')
    }

    if (user.role === UserRole.SUPER_ADMIN) {
      return true
    }

    if (Array.isArray(userRolesAllowed)) {
      if (userRolesAllowed.includes(user.role)) {
        return true
      }
      return false
    }

    if (user.role === userRolesAllowed) {
      return true
    }

    return false
  }
}

import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { UserRole } from '@prisma/client'
import { AUTHORIZATION_KEY } from './auth.decorator'
import { UserWithoutSensitiveData } from '../user/user.type'

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest()
    const isAuthenticated = request.isAuthenticated()
    if (!isAuthenticated) {
      return false
    }

    const userRolesAllowed = this.reflector.get<UserRole | UserRole[]>(AUTHORIZATION_KEY, context.getHandler())
    const user = context.switchToHttp().getRequest().user as UserWithoutSensitiveData

    if (
      user.role === UserRole.SUPER_ADMIN ||
      user.role === userRolesAllowed ||
      (Array.isArray(userRolesAllowed) && userRolesAllowed.includes(user.role))
    ) {
      return true
    }

    return false
  }
}

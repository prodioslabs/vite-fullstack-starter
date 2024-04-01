import { SetMetadata, createParamDecorator, ExecutionContext } from '@nestjs/common'
import { UserRole } from '@prisma/client'
import { UserWithoutSensitiveData } from '../user/user.type'

export const AUTHORIZATION_KEY = 'USER_AUTHORIZATION'

export function AuthorizedFor(userRole: UserRole) {
  return SetMetadata(AUTHORIZATION_KEY, userRole)
}

export function AuthorizedForMultiple(userRoles: UserRole[]) {
  return SetMetadata(AUTHORIZATION_KEY, userRoles)
}

export const User = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest()
  const user = <UserWithoutSensitiveData>request.user
  return user
})

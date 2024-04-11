import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { SessionPayload } from './auth.type'
import { UserWithoutSensitiveData } from '../user/user.type'
import { UserService } from '../user/user.service'
import { AuthRequestShapes, AuthResponseShapes } from './auth.request'
import { SessionService } from '../session/session.service'
@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly sessionService: SessionService,
  ) {}

  async validatePayload(payload: SessionPayload): Promise<UserWithoutSensitiveData> {
    const user = await this.userService.findOneByEmail(payload.email)

    if (!user) {
      throw new NotFoundException('User not found')
    }

    return user
  }

  async login(body: AuthRequestShapes['login']['body']): Promise<AuthResponseShapes['login']> {
    try {
      const user = await this.userService.validateUser(body.email, body.password)
      if (!user) {
        return {
          status: 401,
          body: {
            error: 'Invalid credentials',
          },
        }
      }

      const sessionPayload: SessionPayload = { id: user.id, email: user.email }
      const token = await this.sessionService.createSession(sessionPayload)

      return {
        status: 200,
        body: {
          token: token ? token?.sessionToken : '',
          user,
        },
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        return {
          status: 401,
          body: {
            error: error.message,
          },
        }
      }

      return {
        status: 500,
        body: {
          error: 'Internal server error',
        },
      }
    }
  }

  async signup(body: AuthRequestShapes['signup']['body']): Promise<AuthResponseShapes['signup']> {
    try {
      const userExists = await this.userService.findOneByEmail(body.email)
      if (userExists) {
        throw new BadRequestException('User already exists')
      }

      const user = await this.userService.createUser(body)

      const sessionPayload: SessionPayload = { id: user.id, email: user.email }
      const token = await this.sessionService.createSession(sessionPayload)

      return {
        status: 201,
        body: {
          token: token?.sessionToken,
          user,
        },
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        return {
          status: 409,
          body: {
            error: error.message,
          },
        }
      }
      return {
        status: 500,
        body: {
          error: 'Internal server error',
        },
      }
    }
  }
}

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { JwtPayload } from './auth.type'
import { UserWithoutSensitiveData } from '../user/user.type'
import { UserService } from '../user/user.service'
import { AuthRequestShapes, AuthResponseShapes } from './auth.request'

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validatePayload(payload: JwtPayload): Promise<UserWithoutSensitiveData> {
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

      const jwtPayload: JwtPayload = { id: user.id, email: user.email }
      const token = await this.jwtService.signAsync(jwtPayload)
      return {
        status: 200,
        body: {
          token,
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
      const user = await this.userService.createUser(body)
      const jwtPayload: JwtPayload = { id: user.id, email: user.email }
      const token = await this.jwtService.signAsync(jwtPayload)
      return {
        status: 201,
        body: {
          user,
          token,
        },
      }
    } catch (error) {
      console.log(error)
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

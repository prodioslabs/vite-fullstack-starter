import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common'
import { Request } from 'express'
import * as bcrypt from 'bcrypt'
import { USER_SELECT_FIELDS, UserWithoutSensitiveData } from '../user/user.type'
import { UserService } from '../user/user.service'
import { AuthRequestShapes, AuthResponseShapes } from './auth.request'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly prisma: PrismaService,
  ) {}

  async validateUser(email: string, password: string): Promise<UserWithoutSensitiveData> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { ...USER_SELECT_FIELDS, password: true, salt: true },
    })

    if (!user) {
      throw new UnauthorizedException('Invalid credentials')
    }

    const { password: userPassword, salt, ...restUser } = user
    const hashedPassword = await bcrypt.hash(password, salt)
    if (userPassword !== hashedPassword) {
      throw new UnauthorizedException('Invalid credentials')
    }

    return restUser
  }

  async signup(body: AuthRequestShapes['signup']['body'], request: Request): Promise<AuthResponseShapes['signup']> {
    const userExists = await this.userService.findOneByEmail(body.email)

    if (userExists) {
      throw new ConflictException('User already exists')
    }

    const { name, email, password, role } = body
    const salt = await bcrypt.genSalt()
    const hashedPassword = await bcrypt.hash(password.trim(), salt)
    const user = await this.prisma.user.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        salt,
        role,
      },
      select: USER_SELECT_FIELDS,
    })

    await new Promise<void>((resolve, reject) => {
      // this method is injected by express-session
      // loginIn method generate the session id and store it in the session store
      // and add the session id to the cookies
      request.logIn(user, { session: true }, (err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })

    return {
      status: 201,
      body: {
        user,
      },
    }
  }

  async logout(request: Request): Promise<AuthResponseShapes['logout']> {
    await new Promise<void>((resolve, reject) => {
      request.logOut((error) => {
        if (error) {
          reject(error)
        } else {
          resolve()
        }
      })
    })
    await new Promise<void>((resolve, reject) => {
      request.session.destroy((error) => {
        if (error) {
          reject(error)
        } else {
          resolve()
        }
      })
    })

    return {
      status: 200,
      body: {
        success: true,
      },
    }
  }
}

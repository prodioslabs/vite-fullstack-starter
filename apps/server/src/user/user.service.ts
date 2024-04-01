import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { PrismaService } from '../prisma/prisma.service'
import { USER_SELECT_FIELDS, UserWithoutSensitiveData } from './user.type'
import { AuthRequestShapes } from '../auth/auth.request'

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findOneByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: {
        email,
      },
      select: USER_SELECT_FIELDS,
    })
  }

  async validateUser(email: string, password: string): Promise<UserWithoutSensitiveData> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { ...USER_SELECT_FIELDS, password: true, salt: true },
    })

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`)
    }

    const { password: userPassword, salt, ...restUser } = user
    const hashedPassword = await bcrypt.hash(password, salt)
    if (userPassword !== hashedPassword) {
      throw new NotFoundException('Invalid password')
    }

    return restUser
  }

  async createUser(body: AuthRequestShapes['signup']['body']): Promise<UserWithoutSensitiveData> {
    const existedUser = await this.findOneByEmail(body.email)

    if (existedUser) {
      throw new BadRequestException('User already exists')
    }

    const { name, email, password, role } = body
    const salt = await bcrypt.genSalt()
    const hashedPassword = await bcrypt.hash(password.trim(), salt)
    const userCreated = await this.prisma.user.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        salt,
        role,
      },
      select: USER_SELECT_FIELDS,
    })

    return userCreated
  }
}

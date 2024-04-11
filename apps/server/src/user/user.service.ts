import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { USER_SELECT_FIELDS } from './user.type'

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
}

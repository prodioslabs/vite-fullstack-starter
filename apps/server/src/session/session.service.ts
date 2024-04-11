import { JwtService } from '@nestjs/jwt'
import * as dayjs from 'dayjs'
import { BadRequestException, Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { SessionPayload } from './session.type'

@Injectable()
export class SessionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async createSession(sessionPayload: SessionPayload) {
    try {
      const token = await this.jwtService.signAsync(sessionPayload)

      return await this.prisma.session.upsert({
        where: {
          id: sessionPayload.id,
        },
        update: {
          sessionToken: token,
        },
        create: {
          sessionToken: token,
          expires: dayjs().add(7, 'day').toDate(),
          user: {
            connect: {
              id: sessionPayload.id,
            },
          },
        },
      })
    } catch (error) {
      throw new BadRequestException('Failed to create session')
    }
  }

  async findSession(sessionPayload: SessionPayload) {
    const session = await this.prisma.session.findUnique({
      where: {
        id: sessionPayload.id,
      },
    })

    return session?.sessionToken ?? null
  }
}

import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PrismaModule } from '../prisma/prisma.module'
import { SessionService } from './session.service'

@Module({
  imports: [PrismaModule, JwtModule],
  controllers: [],
  providers: [SessionService],
  exports: [SessionService],
})
export class SessionModule {}

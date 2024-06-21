import { Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'
import { ConfigModule } from '@nestjs/config'
import { AuthController } from './auth.controller'
import { LocalStrategy } from './local.strategy'
import { AuthService } from './auth.service'
import { UserModule } from '../user/user.module'
import { PrismaModule } from '../prisma/prisma.module'
import { SessionSerializer } from './session.serializer'
import { AuditLogModule } from '../audit-log/audit-log.module'

@Module({
  imports: [
    PassportModule.register({
      property: 'user',
      session: true,
    }),
    UserModule,
    ConfigModule,
    PrismaModule,
    AuditLogModule,
  ],
  controllers: [AuthController],
  providers: [LocalStrategy, AuthService, SessionSerializer],
  exports: [PassportModule],
})
export class AuthModule {}

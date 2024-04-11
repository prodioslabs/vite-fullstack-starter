import { Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'
import { ConfigModule } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { AuthController } from './auth.controller'
import { LocalStrategy } from './local.strategy'
import { AuthService } from './auth.service'
import { UserModule } from '../user/user.module'
import { SessionSerializer } from '../session/session.serializer'
import { SessionService } from '../session/session.service'
import { SessionModule } from '../session/session.module'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [
    PassportModule.register({
      property: 'user',
      session: true,
    }),
    UserModule,
    ConfigModule,
    SessionModule,
    PrismaModule,
    JwtModule.register({
      secret: process.env.SESSION_SECRET,
      signOptions: { expiresIn: process.env.SESSION_COOKIE_MAX_AGE },
    }),
  ],
  controllers: [AuthController],
  providers: [LocalStrategy, AuthService, SessionSerializer, SessionService],
  exports: [PassportModule],
})
export class AuthModule {}

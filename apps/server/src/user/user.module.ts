import { Module } from '@nestjs/common'
import { UserController } from './user.controller'
import { PrismaModule } from '../prisma/prisma.module'
import { UserService } from './user.service'

@Module({
  imports: [PrismaModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {
  async findOneByEmail() {}
}

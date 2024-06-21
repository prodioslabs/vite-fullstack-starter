import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Client } from 'minio'
import { PrismaModule } from '../prisma/prisma.module'
import { FileService } from './file.service'
import { Environment } from '../config/env.config'
import { FileController } from './file.controller'

@Module({
  imports: [PrismaModule],
  providers: [
    FileService,
    {
      provide: 'MINIO_CLIENT',
      useFactory: (configService: ConfigService<Environment>) => {
        return new Client({
          endPoint: configService.get<string>('MINIO_HOST')!,
          port: configService.get<number>('MINIO_PORT'),
          useSSL: false,
          accessKey: configService.get<string>('MINIO_ACCESS_KEY')!,
          secretKey: configService.get<string>('MINIO_SECRET_KEY')!,
        })
      },
      inject: [ConfigService],
    },
  ],
  controllers: [FileController],
  exports: [FileService],
})
export class FileModule {}

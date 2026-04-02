import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { Client } from 'minio'
import { Environment } from 'src/env/env'
import { LogModule } from 'src/log/log.module'

import { FileController } from './file.controller'
import { FileService } from './file.service'

@Module({
  imports: [ConfigModule, LogModule],
  providers: [
    FileService,
    {
      provide: 'MINIO_CLIENT',
      useFactory: async (configService: ConfigService<Environment>) => {
        const client = new Client({
          endPoint: configService.get('S3_ENDPOINT', { infer: true })!,
          port: configService.get('S3_PORT', { infer: true }),
          useSSL: configService.get('S3_USE_SSL', { infer: true }),
          accessKey: configService.get('S3_ACCESS_KEY', { infer: true })!,
          secretKey: configService.get('S3_SECRET_KEY', { infer: true })!,
          region: configService.get('S3_REGION', { infer: true }),
        })

        const bucket = configService.get('S3_BUCKET', { infer: true })!
        const exists = await client.bucketExists(bucket)
        if (!exists) {
          await client.makeBucket(bucket)
        }

        return client
      },
      inject: [ConfigService],
    },
  ],
  controllers: [FileController],
  exports: [FileService],
})
export class FileModule {}

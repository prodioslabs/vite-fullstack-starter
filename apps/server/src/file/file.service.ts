import { Inject, Injectable, NotFoundException, StreamableFile } from '@nestjs/common'
import { Client } from 'minio'
import * as dayjs from 'dayjs'
import { PrismaService } from '../prisma/prisma.service'
import { FileResponseShapes } from './file.request'
import { UserWithoutSensitiveData } from '../user/user.type'

@Injectable()
export class FileService {
  constructor(
    @Inject('MINIO_CLIENT') private readonly minioClient: Client,
    private readonly prisma: PrismaService,
  ) {}

  async uploadFile(
    body: FileResponseShapes['uploadFile']['body'],
    file: Express.Multer.File,
    user: UserWithoutSensitiveData,
  ): Promise<FileResponseShapes['uploadFile']> {
    try {
      const bucket = dayjs().format('DD-MM-YYYY')
      // check if bucket for today exists or not
      // and create if doesn't exist
      if (!(await this.minioClient.bucketExists(bucket))) {
        await this.minioClient.makeBucket(bucket)
      }

      const filename = `${dayjs().unix()}_${file.originalname}`
      await this.minioClient.putObject(bucket, filename, file.buffer)

      try {
        const fileRecord = await this.prisma.file.create({
          data: {
            bucket,
            filename,
            mimeType: file.mimetype,
            size: file.size,
            createdBy: {
              connect: {
                id: user.id,
              },
            },
          },
        })
        return {
          status: 201,
          body: {
            id: fileRecord.id,
            bucket,
            filename,
            mimeType: file.mimetype,
          },
        }
      } catch (error) {
        await this.minioClient.removeObject(bucket, filename)

        const errorMessage = error instanceof Error ? error.message : 'Something went wrong'
        return {
          status: 500,
          body: {
            error: errorMessage,
          },
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong'
      return {
        status: 500,
        body: {
          error: errorMessage,
        },
      }
    }
  }

  async getFile(params: { bucket: string; filename: string }) {
    try {
      const [objectMetata, stream] = await Promise.all([
        this.minioClient.statObject(params.bucket, params.filename),
        this.minioClient.getObject(params.bucket, params.filename),
      ])
      const contentType = objectMetata.metaData['content-type']
      return new StreamableFile(stream, {
        type: contentType,
      })
    } catch (error) {
      throw new NotFoundException('File not found')
    }
  }

  async getFileById(id: string) {
    try {
      const fileRecord = await this.prisma.file.findUniqueOrThrow({ where: { id } })

      const stream = await this.minioClient.getObject(fileRecord.bucket, fileRecord.filename)

      return new StreamableFile(stream, {
        disposition: `attachment; filename=${fileRecord.filename}`,
        type: fileRecord.mimeType,
      })
    } catch {
      throw new NotFoundException('File not found!')
    }
  }
}

import path from 'node:path'

import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  StreamableFile,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { UserSession } from '@thallesp/nestjs-better-auth'
import dayjs from 'dayjs'
import { eq } from 'drizzle-orm'
import type { Express } from 'express'
import { Client, ItemBucketMetadata, S3Error } from 'minio'
import { customAlphabet } from 'nanoid'
import sharp from 'sharp'

import { db } from '../db'
import { file as fileSchema } from '../db/schema/file'
import { Environment } from '../env/env'
import { formatErrorMessage } from '../utils/format'

import {
  ALLOWED_FILE_TYPES,
  ALLOWED_IMAGE_MIMETYPES,
  MAX_FILE_SIZE_IN_BYTES,
  MAX_IMAGE_SIZE,
  UPLOADED_FILES_ROOT_DIR_NAME,
} from './file.constants'
import { isValidFilename } from './file.utils'

type User = UserSession['user']

@Injectable()
export class FileService {
  private readonly logger = new Logger(FileService.name)

  constructor(
    @Inject('MINIO_CLIENT') private readonly minioClient: Client,
    private readonly configService: ConfigService<Environment>,
  ) {}

  async uploadFile(
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    file: Express.Multer.File,
    user: User,
  ) {
    this.logger.log(`Uploading file ${file.originalname} for user ${user.id}`)
    try {
      if (!isValidFilename(file.originalname)) {
        throw new BadRequestException(
          'The file name is not allowed. Please rename the file and try again.',
        )
      }

      const { fileTypeFromBuffer } = await import('file-type')
      const fileType = await fileTypeFromBuffer(file.buffer)

      if (!fileType) {
        throw new BadRequestException('Failed to get file type')
      }

      if (!this.validateFileType(fileType, file, ALLOWED_FILE_TYPES)) {
        const allowedTypesDescription = ALLOWED_FILE_TYPES.map(
          ({ mimeType, extensions }) =>
            `${mimeType} (${extensions.join(', ')})`,
        ).join('; ')
        throw new BadRequestException(
          `Invalid file type or extension. Allowed types and extensions: ${allowedTypesDescription}.`,
        )
      }

      if (file.mimetype !== fileType.mime) {
        throw new BadRequestException(
          'The selected file format is not supported. Please upload a valid file.',
        )
      }

      const { bucket, objectName: filename } = await this.uploadBuffer(
        file.buffer,
        file.originalname,
        'files',
        file.size,
        {
          'content-type': fileType.mime,
          'created-by': user.id,
          filename: file.originalname,
        },
      )

      try {
        const [fileRecord] = await db
          .insert(fileSchema)
          .values({
            bucket,
            filename,
            mimeType: file.mimetype,
            size: file.size,
            createdById: user.id,
          })
          .returning()

        return {
          id: fileRecord.id,
          bucket,
          filename,
          mimeType: file.mimetype,
        }
      } catch (error) {
        this.logger.error(
          `Error while creating file: ${formatErrorMessage(error)}`,
        )
        await this.minioClient.removeObject(bucket, filename)
        throw new BadRequestException('Error while saving file record')
      }
    } catch (error) {
      if (error instanceof BadRequestException) throw error
      this.logger.error(
        `Failed to upload file ${file.originalname}: ${formatErrorMessage(error)}`,
      )
      throw error
    }
  }

  async uploadImage(
    body: {
      crop: {
        unit: '%' | 'px'
        x: number
        y: number
        width: number
        height: number
      }
    },
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    multerFile: Express.Multer.File,
    user: User,
  ) {
    this.logger.log(
      `Uploading image ${multerFile.originalname} for user ${user.id}`,
    )
    try {
      if (!isValidFilename(multerFile.originalname)) {
        throw new BadRequestException(
          'The file name is not allowed. Please rename the file and try again.',
        )
      }

      const { fileTypeFromBuffer } = await import('file-type')
      const fileType = await fileTypeFromBuffer(multerFile.buffer)

      if (!fileType) {
        throw new BadRequestException('Failed to get file type')
      }

      if (
        !this.validateFileType(fileType, multerFile, ALLOWED_IMAGE_MIMETYPES)
      ) {
        throw new BadRequestException('Invalid image type.')
      }

      if (multerFile.mimetype !== fileType.mime) {
        throw new BadRequestException(
          'The selected file format is not supported.',
        )
      }

      const buffer = await this.cropImage(multerFile.buffer, body.crop)

      const { bucket, objectName: filename } = await this.uploadBuffer(
        buffer,
        multerFile.originalname,
        'files',
        multerFile.size,
        {
          'content-type': fileType.mime,
          'created-by': user.id,
          filename: multerFile.originalname,
        },
      )

      try {
        const [fileRecord] = await db
          .insert(fileSchema)
          .values({
            bucket,
            filename,
            mimeType: multerFile.mimetype,
            size: multerFile.size,
            createdById: user.id,
          })
          .returning()

        return {
          id: fileRecord.id,
          bucket,
          filename,
          mimeType: multerFile.mimetype,
        }
      } catch (error) {
        this.logger.error(
          `Error while creating file: ${formatErrorMessage(error)}`,
        )
        await this.minioClient.removeObject(bucket, filename)
        throw new BadRequestException('Error while saving file record')
      }
    } catch (error) {
      this.logger.error(`Failed to upload image: ${formatErrorMessage(error)}`)

      if (error instanceof BadRequestException) {
        throw error
      }

      throw error
    }
  }

  async getFileBufferById(id: string) {
    try {
      const fileRecord = await db.query.file.findFirst({
        where: eq(fileSchema.id, id),
      })

      if (!fileRecord) {
        return null
      }

      const stream = await this.minioClient.getObject(
        fileRecord.bucket,
        fileRecord.filename,
      )
      return { stream, fileRecord }
    } catch (error) {
      this.logger.error(
        `Error getting file ${id}: ${formatErrorMessage(error)}`,
      )
      return null
    }
  }

  async getFileById(id: string) {
    const result = await this.getFileBufferById(id)

    if (result) {
      return new StreamableFile(result.stream, {
        disposition: `attachment; filename=${result.fileRecord.filename}`,
        type: result.fileRecord.mimeType,
      })
    }

    throw new NotFoundException('File not found!')
  }

  async getFile(
    params: { bucket: string; objectName: string },
    isPublic: boolean = false,
  ) {
    if (isPublic && params.objectName.includes(UPLOADED_FILES_ROOT_DIR_NAME)) {
      throw new NotFoundException('File not found')
    }

    try {
      const objectName = params.objectName.replace(/&amp;/g, '&')
      const [objectMetadata, stream_] = await Promise.all([
        this.minioClient.statObject(params.bucket, objectName),
        this.minioClient.getObject(params.bucket, objectName),
      ])

      let stream = stream_

      const contentType = objectMetadata.metaData['content-type']
      const sizeInByte = objectMetadata.size
      if (
        sizeInByte >= MAX_FILE_SIZE_IN_BYTES &&
        typeof contentType === 'string' &&
        contentType.startsWith('image/') &&
        contentType !== 'image/svg'
      ) {
        stream = stream.pipe(sharp().resize(MAX_IMAGE_SIZE))
      }
      return new StreamableFile(stream, { type: contentType })
    } catch (error) {
      this.logger.error(
        `Failed to get file ${params.objectName}: ${formatErrorMessage(error)}`,
      )
      throw new NotFoundException('File not found')
    }
  }

  async deleteFile(fileId: string) {
    this.logger.log(`Deleting file ${fileId}`)
    const fileRecord = await db.query.file.findFirst({
      where: eq(fileSchema.id, fileId),
    })

    if (!fileRecord) {
      throw new NotFoundException('File not found')
    }

    try {
      await this.minioClient.removeObject(
        fileRecord.bucket,
        fileRecord.filename,
      )
    } catch (error) {
      if (error instanceof S3Error && error.code?.startsWith('NoSuch')) {
        this.logger.error(
          `Error deleting object from minio: ${formatErrorMessage(error)}`,
        )
      } else {
        throw error
      }
    }
    await db.delete(fileSchema).where(eq(fileSchema.id, fileId))

    this.logger.log(`Successfully deleted ${fileId}`)
  }

  async uploadBuffer(
    buffer: Buffer,
    incomingFilename?: string,
    subPath = 'files',
    size?: number,
    metaData?: ItemBucketMetadata,
  ) {
    const bucket = this.configService.get('S3_BUCKET', { infer: true })!
    const fileName = [
      this.generateRandomFileId(),
      incomingFilename
        ? await this.sanitizeFileName(incomingFilename)
        : undefined,
    ]
      .filter(Boolean)
      .join('_')
    const objectName = [
      UPLOADED_FILES_ROOT_DIR_NAME,
      subPath,
      dayjs().format('DD-MM-YYYY'),
      fileName,
    ].join('/')

    await this.minioClient.putObject(bucket, objectName, buffer, size, metaData)

    return { bucket, objectName }
  }

  async getFileByBucketAndName(
    bucket: string,
    filename: string,
    mimeType: string,
  ) {
    try {
      const stream = await this.minioClient.getObject(bucket, filename)
      return new StreamableFile(stream, {
        disposition: `attachment; filename=${filename}`,
        type: mimeType,
      })
    } catch (error) {
      this.logger.error(
        `Error getting file bucket=${bucket} filename=${filename}: ${formatErrorMessage(error)}`,
      )

      throw new NotFoundException('File not found!')
    }
  }

  generateRandomFileId = customAlphabet(
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
    16,
  )

  async sanitizeFileName(filename: string) {
    const filenamify = await import('filenamify').then((m) => m.default)
    let sanitized = filenamify(filename)
    sanitized = sanitized
      .split(' ')
      .map((val) => val.replace(/[^a-zA-Z0-9.]/g, '_'))
      .join('')
    return sanitized
  }

  private async cropImage(
    fileBuffer: Buffer,
    crop: {
      unit: '%' | 'px'
      x: number
      y: number
      width: number
      height: number
    },
  ): Promise<Buffer> {
    const metadata = await sharp(fileBuffer).metadata()
    const {
      width: initialWidth = 0,
      height: initialHeight = 0,
      orientation = 1,
    } = metadata
    const { width, height } = this.getNormalSize({
      width: initialWidth,
      height: initialHeight,
      orientation,
    })
    const extractDimensions = {
      width:
        crop.unit === '%'
          ? Math.floor((width * crop.width) / 100)
          : Math.floor(crop.width),
      height:
        crop.unit === '%'
          ? Math.floor((height * crop.height) / 100)
          : Math.floor(crop.height),
      top:
        crop.unit === '%'
          ? Math.floor((height * crop.y) / 100)
          : Math.floor(crop.y),
      left:
        crop.unit === '%'
          ? Math.floor((width * crop.x) / 100)
          : Math.floor(crop.x),
    }
    const resizeWidth = Math.min(MAX_IMAGE_SIZE, extractDimensions.width)
    return sharp(fileBuffer)
      .extract(extractDimensions)
      .rotate()
      .resize(resizeWidth)
      .toBuffer()
  }

  private getNormalSize({
    width,
    height,
    orientation,
  }: {
    width: number
    height: number
    orientation: number
  }) {
    // EXIF orientation values and their meanings:
    // 1 = Normal
    // 2 = Horizontal flip
    // 3 = 180° rotation
    // 4 = Vertical flip
    // 5 = Horizontal flip + 90° rotation clockwise
    // 6 = 90° rotation clockwise
    // 7 = Horizontal flip + 90° rotation counter-clockwise
    // 8 = 90° rotation counter-clockwise
    return (orientation || 0) >= 5
      ? { width: height, height: width }
      : { width, height }
  }

  private validateFileType(
    fileType: { mime: string; ext: string },
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    file: Express.Multer.File,
    allowedMimeTypes: { mimeType: string; extensions: string[] }[],
  ) {
    return allowedMimeTypes.some((allowedFileType) => {
      const incomingFileExtension = path
        .extname(file.originalname)
        .replace('.', '')
        .trim()
        .toLowerCase()
      return (
        fileType.mime === allowedFileType.mimeType &&
        allowedFileType.extensions.includes(fileType.ext) &&
        allowedFileType.extensions.includes(incomingFileExtension)
      )
    })
  }
}

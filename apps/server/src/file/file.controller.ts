import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Header,
  InternalServerErrorException,
  Logger,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { cropInputSchema } from '@repo/contracts'
import {
  AuthGuard,
  Session,
  type UserSession,
} from '@thallesp/nestjs-better-auth'
import * as z from 'zod'

import { FileService } from './file.service'

@UseGuards(AuthGuard)
@Controller('file')
export class FileController {
  private readonly logger = new Logger(FileController.name)

  constructor(private readonly fileService: FileService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Session() session: UserSession,
  ) {
    return this.fileService.uploadFile(file, session.user)
  }

  @Post('upload-image')
  @UseInterceptors(FileInterceptor('file'))
  uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: Record<string, unknown>,
    @Session() session: UserSession,
  ) {
    if (!body.crop || typeof body.crop !== 'string') {
      throw new BadRequestException('Invalid body')
    }

    let json: undefined | object
    try {
      json = JSON.parse(body.crop)
    } catch (error) {
      this.logger.error(error, 'error parsing crop body')
      throw new InternalServerErrorException('Error parsing body')
    }
    const parsed = cropInputSchema.safeParse(json)
    if (!parsed.success) {
      this.logger.error(z.treeifyError(parsed.error).errors.join(', '))
      throw new BadRequestException('Invalid body')
    }

    return this.fileService.uploadImage(parsed.data, file, session.user)
  }

  @Get('uploaded-file/:bucket/{*objectName}')
  @Header('Cache-Control', 'max-age=604800')
  getFile(
    @Param('bucket') bucket: string,
    @Param('objectName') objectName: string | string[],
  ) {
    // In NestJS 11, wildcard params (*objectName) are returned as string[], so we need to join them to get the full path

    const path = Array.isArray(objectName) ? objectName.join('/') : objectName

    return this.fileService.getFile({ bucket, objectName: path }, false)
  }

  @Get(':bucket/{*objectName}')
  @Header('Cache-Control', 'max-age=604800')
  getPublicFile(
    @Param('bucket') bucket: string,
    @Param('objectName') objectName: string | string[],
  ) {
    // In NestJS 11, wildcard params (*objectName) are returned as string[], so we need to join them to get the full path
    const path = Array.isArray(objectName) ? objectName.join('/') : objectName
    this.logger.log({ bucket, path })

    return this.fileService.getFile({ bucket, objectName: path }, true)
  }
}

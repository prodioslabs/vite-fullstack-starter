import {
  Body,
  Controller,
  Get,
  Header,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import {
  AuthGuard,
  Session,
  type UserSession,
} from '@thallesp/nestjs-better-auth'

import { FileService } from './file.service'

@UseGuards(AuthGuard)
@Controller('file')
export class FileController {
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
    @Body() input: any,
    @Session() session: UserSession,
  ) {
    return this.fileService.uploadImage(input, file, session.user)
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

  @Get('file/:bucket/{*objectName}')
  @Header('Cache-Control', 'max-age=604800')
  getPublicFile(
    @Param('bucket') bucket: string,
    @Param('objectName') objectName: string | string[],
  ) {
    // In NestJS 11, wildcard params (*objectName) are returned as string[], so we need to join them to get the full path
    const path = Array.isArray(objectName) ? objectName.join('/') : objectName

    return this.fileService.getFile({ bucket, objectName: path }, true)
  }
}

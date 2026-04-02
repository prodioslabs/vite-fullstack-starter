import {
  Controller,
  Get,
  Header,
  Param,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { Implement, implement } from '@orpc/nest'
import { contract } from '@repo/contracts'
import {
  AuthGuard,
  Session,
  type UserSession,
} from '@thallesp/nestjs-better-auth'

import { FileService } from './file.service'

@UseGuards(AuthGuard)
@Controller()
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Implement(contract.file.uploadFile)
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Session() session: UserSession,
  ) {
    return implement(contract.file.uploadFile).handler(async () => {
      return this.fileService.uploadFile(file, session.user)
    })
  }

  @Implement(contract.file.uploadImage)
  @UseInterceptors(FileInterceptor('file'))
  uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Session() session: UserSession,
  ) {
    return implement(contract.file.uploadImage).handler(async ({ input }) => {
      return this.fileService.uploadImage(input, file, session.user)
    })
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

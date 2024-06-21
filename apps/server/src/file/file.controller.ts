import { Controller, Get, Header, Param, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common'
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest'
import { contract } from '@repo/contract'
import { FileInterceptor } from '@nestjs/platform-express'
import { FileService } from './file.service'
import { AuthorizationGuard } from '../auth/auth.guard'
import { User } from '../auth/auth.decorator'
import { UserWithoutSensitiveData } from '../user/user.type'

@Controller()
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @UseGuards(AuthorizationGuard)
  @TsRestHandler(contract.file.uploadFile)
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: Express.Multer.File, @User() user: UserWithoutSensitiveData) {
    return tsRestHandler(contract.file.uploadFile, ({ body }) => this.fileService.uploadFile(body, file, user))
  }

  @Get('file/:bucket/:filename')
  @Header('Cache-Control', 'max-age=604800') // cache for 7 days
  getFile(@Param() params: { bucket: string; filename: string }) {
    return this.fileService.getFile(params)
  }
}

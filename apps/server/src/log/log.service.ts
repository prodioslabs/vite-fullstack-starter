/* eslint-disable @typescript-eslint/no-explicit-any */
import { ConsoleLogger, LoggerService } from '@nestjs/common'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class LogService extends ConsoleLogger implements LoggerService {
  constructor(private readonly configService: ConfigService) {
    super({ json: true })
  }

  log(message: any, ...optionalParams: any[]) {
    super.log(message, ...optionalParams)
  }

  error(message: any, ...optionalParams: any[]) {
    super.error(message, ...optionalParams)
  }

  warn(message: any, ...optionalParams: any[]) {
    super.warn(message, ...optionalParams)
  }

  debug(message: any, ...optionalParams: any[]) {
    super.debug(message, ...optionalParams)
  }

  verbose(message: any, ...optionalParams: any[]) {
    super.verbose(message, ...optionalParams)
  }

  fatal(message: any, ...optionalParams: any[]) {
    super.fatal(message, ...optionalParams)
  }
}

import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import { Response, Request } from 'express'
import { ZodError } from 'zod'

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name)

  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()
    const origin = request.headers.origin

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR

    this.logger.log({
      path: request.path,
      origin,
      exception,
    })

    let message = exception.message
    // add checks for validation error, if there is any zod validation error
    // then show better messages
    // @ts-expect-error expection might contain the response object
    const bodyResult = exception?.response?.bodyResult
    if (bodyResult instanceof ZodError) {
      message = bodyResult.issues.map((issue) => issue.message).join(', ')
    }

    response.status(status).json({
      error: message,
    })
  }
}

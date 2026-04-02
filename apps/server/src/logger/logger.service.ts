import {
  ConsoleLogger,
  Injectable,
  LogLevel,
  LoggerService as NestLoggerService,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios, { type AxiosInstance } from 'axios'
import { ClsService } from 'nestjs-cls'

import { Environment } from '../env/env'

const LOKI_LOG_LEVEL_MAP: Record<LogLevel, string> = {
  debug: 'debug',
  error: 'error',
  log: 'info',
  verbose: 'verbose',
  warn: 'warning',
  fatal: 'critical',
} as const

type Message = { level: LogLevel; context?: string } & {
  [key: string]: unknown
}

@Injectable()
export class LoggerService extends ConsoleLogger implements NestLoggerService {
  #lokiAxiosInstance?: AxiosInstance = undefined

  constructor(
    private readonly configService: ConfigService<Environment>,
    private readonly clsService: ClsService,
  ) {
    super({ json: true })

    if (this.configService.get('LOKI_HOST')) {
      const headers: Record<string, unknown> = {
        'Content-Type': 'application/json',
      }

      const username = this.configService.get<string>('LOKI_USERNAME')
      const password = this.configService.get<string>('LOKI_PASSWORD')

      const token = this.configService.get<string>('LOKI_TOKEN')
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      this.#lokiAxiosInstance = axios.create({
        baseURL: this.configService.get('LOKI_HOST'),
        auth: username && password ? { username, password } : undefined,
        headers,
      })
    }
  }

  #logToLoki = (message: Message) => {
    if (!this.#lokiAxiosInstance) {
      return
    }

    const level = LOKI_LOG_LEVEL_MAP[message.level] || message.level
    const contextString = message.context ?? 'default'
    const requestId = this.clsService.getId()

    const lokiPayload = {
      streams: [
        {
          stream: {
            label: level,
            context: contextString,
            service_name: contextString,
            request_id: requestId ?? 'unknown',
            app: 'ssc-portal-server',
          },
          values: [
            [
              Date.now().toString() + '000000',
              JSON.stringify({
                ...message,
                level,
              }),
            ],
          ],
        },
      ],
    }

    this.#lokiAxiosInstance
      .post('/loki/api/v1/push', lokiPayload)
      .catch((err) => {
        super.error(
          'failed to send log to Loki',
          err instanceof Error ? err.stack : undefined,
        )
      })
  }

  log(message: unknown, context?: unknown, ...rest: unknown[]): void {
    super.log(message, context, ...rest)
    const jsonPayload = this.getJsonLogObject(message, {
      context: context as string,
      logLevel: 'log',
    })
    this.#logToLoki(jsonPayload)
  }

  error(
    message: unknown,
    stack?: unknown,
    context?: unknown,
    ...rest: unknown[]
  ): void {
    super.error(message, stack, context, ...rest)
    const jsonPayload = this.getJsonLogObject(message, {
      context: context as string,
      logLevel: 'error',
      errorStack: stack as string,
    })
    this.#logToLoki(jsonPayload)
  }

  verbose(message: unknown, context?: unknown, ...rest: unknown[]): void {
    super.verbose(message, context, ...rest)
    const jsonPayload = this.getJsonLogObject(message, {
      context: context as string,
      logLevel: 'verbose',
    })
    this.#logToLoki(jsonPayload)
  }

  warn(message: unknown, context?: unknown, ...rest: unknown[]): void {
    super.warn(message, context, ...rest)
    const jsonPayload = this.getJsonLogObject(message, {
      context: context as string,
      logLevel: 'warn',
    })
    this.#logToLoki(jsonPayload)
  }

  debug(message: unknown, context?: unknown, ...rest: unknown[]): void {
    super.debug(message, context, ...rest)
    const jsonPayload = this.getJsonLogObject(message, {
      context: context as string,
      logLevel: 'debug',
    })
    this.#logToLoki(jsonPayload)
  }
}

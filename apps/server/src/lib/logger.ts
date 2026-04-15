import { pino, type TransportTargetOptions } from 'pino'

import { env } from './env'
import { APP_SERVER_ID } from './id'

const transportTargets: TransportTargetOptions[] = []
if (env.LOKI_HOST) {
  transportTargets.push({
    level: env.NODE_ENV === 'development' ? 'debug' : 'info',
    target: 'pino-loki',
    options: {
      host: env.LOKI_HOST,
      basicAuth:
        env.LOKI_USERNAME && env.LOKI_PASSWORD
          ? { username: env.LOKI_USERNAME, password: env.LOKI_PASSWORD }
          : undefined,
      propsToLabels: ['app', 'component', 'serverId', 'requestId'],
    },
  })
}

transportTargets.push({
  target: 'pino-pretty',
  level: env.NODE_ENV === 'development' ? 'debug' : 'info',
})

export const logger = pino({
  level: env.NODE_ENV === 'development' ? 'debug' : 'info',
  transport: {
    targets: transportTargets,
  },
  base: { app: 'server', serverId: APP_SERVER_ID },
})

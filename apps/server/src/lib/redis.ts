import IORedis from 'ioredis'

import { env } from './env'

let _redisConnection: IORedis | undefined
export function getRedisClient() {
  if (!env.REDIS_HOST || !env.REDIS_PORT) {
    throw new Error('invalid redis configuration')
  }

  if (!_redisConnection) {
    _redisConnection = new IORedis({
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
      username: env.REDIS_USERNAME,
      password: env.REDIS_PASSWORD,
      db: env.REDIS_DB,
      maxRetriesPerRequest: null,
    })
  }

  return _redisConnection
}

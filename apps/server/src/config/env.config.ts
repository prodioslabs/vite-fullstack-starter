import * as joi from 'types-joi'

const DEFAULT_JOB_TIMEOUT_MS = 300000

export const validationSchema = joi
  .object({
    PORT: joi.number().default(3000),
    SESSION_SECRET: joi.string(),
    SESSION_COOKIE_MAX_AGE: joi.number(),
    DATABASE_URL: joi.string().required(),
    JOB_TIMEOUT_MS: joi.number().default(DEFAULT_JOB_TIMEOUT_MS),
    REDIS_URL: joi.string().required(),
    BROWSERLESS_WS_ENDPOINT: joi.string(),
    MINIO_HOST: joi.string().required(),
    MINIO_PORT: joi.number().required(),
    MINIO_ACCESS_KEY: joi.string().required(),
    MINIO_SECRET_KEY: joi.string().required(),
  })
  .required()

export type Environment = joi.InterfaceFrom<typeof validationSchema>

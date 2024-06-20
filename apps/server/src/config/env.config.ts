import * as joi from 'types-joi'

const DEFAULT_JOB_TIMEOUT_MS = 300000

export const validationSchema = joi
  .object({
    SESSION_SECRET: joi.string(),
    SESSION_COOKIE_MAX_AGE: joi.number(),
    DATABASE_URL: joi.string().required(),
    JOB_TIMEOUT_MS: joi.number().default(DEFAULT_JOB_TIMEOUT_MS),
    REDIS_URL: joi.string().required(),
  })
  .required()

export type Environment = joi.InterfaceFrom<typeof validationSchema>

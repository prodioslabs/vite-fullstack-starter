import { zValidator } from '@hono/zod-validator'
import dayjs from 'dayjs'
import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import * as z from 'zod'

import { captcha as captchaSchema } from '../db/schema'
import { db } from '../lib/db'
import { logger } from '../lib/logger'

import { captchaGenerator, createCaptchaImage } from './captcha.utils'

export const captchaRouter = new Hono().get(
  '/',
  zValidator(
    'query',
    z.object({
      width: z.coerce.number().optional().default(200),
      height: z.coerce.number().optional().default(90),
    }),
  ),
  async function generateCaptcha(c) {
    const component = 'generateCapthcha'
    const requestId = c.get('requestId')

    const { width, height } = c.req.valid('query')
    logger.info({ component, requestId, width, height }, 'generating captcha')
    const captcha = captchaGenerator()
    const captchaImage = await createCaptchaImage({ width, height, captcha })
    logger.info({ component, requestId, width, height }, 'generated captcha')

    const savedCaptcha = await db
      .insert(captchaSchema)
      .values({
        captcha,
        expiresAt: dayjs().add(2, 'minutes').toDate(),
        status: 'PENDING',
      })
      .returning()
      .then((val) => val[0])

    if (!savedCaptcha) {
      throw new HTTPException(404, { message: 'Failed to generate captcha' })
    }

    return c.body(Buffer.from(captchaImage), 200, {
      'Content-Type': 'image/png',
      'Content-Disposition': 'inline',
      'X-Captcha-Problem': savedCaptcha.id,
    })
  },
)

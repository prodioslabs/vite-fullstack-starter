import { zValidator } from '@hono/zod-validator'
import dayjs from 'dayjs'
import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import * as z from 'zod'

import { captcha as captchaSchema } from '../db/schema'
import { db } from '../lib/db'

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
    const { width, height } = c.req.valid('query')

    const captcha = captchaGenerator()
    const captchaImage = await createCaptchaImage({ width, height, captcha })

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

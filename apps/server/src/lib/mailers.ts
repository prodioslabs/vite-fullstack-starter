import { createTransport } from 'nodemailer'

import { env } from './env'

export const mailer = createTransport({
  service: 'gmail',
  auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD },
})

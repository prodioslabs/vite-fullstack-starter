import { Hono } from 'hono'

import { verifyCaptchaMiddleware } from '../captcha/captcha.middleware'
import { auth } from '../lib/auth'

export const authRouter = new Hono()
  .post('sign-in/email', verifyCaptchaMiddleware, function handleRequest(c) {
    return auth.handler(c.req.raw)
  })
  .post('sign-up/email', verifyCaptchaMiddleware, function handleRequest(c) {
    return auth.handler(c.req.raw)
  })
  .post(
    'request-password-reset',
    verifyCaptchaMiddleware,
    function handleRequest(c) {
      return auth.handler(c.req.raw)
    },
  )
  .post('reset-password', verifyCaptchaMiddleware, function handleRequest(c) {
    return auth.handler(c.req.raw)
  })
  .on(['POST', 'GET'], '/*', function handleRest(c) {
    return auth.handler(c.req.raw)
  })

import { Hono } from 'hono'

import { verifyCaptchaMiddleware } from '../captcha/captcha.middleware'
import { auth } from '../lib/auth'

export const authRouter = new Hono()
  .post('sign-in/email', verifyCaptchaMiddleware, function signInWithEmail(c) {
    return auth.handler(c.req.raw)
  })
  .post('sign-up/email', verifyCaptchaMiddleware, function signUpWithEmail(c) {
    return auth.handler(c.req.raw)
  })
  // TODO: Add verifyCatpchaMiddleware with verify password
  .on(['POST', 'GET'], '/*', function handleRest(c) {
    return auth.handler(c.req.raw)
  })

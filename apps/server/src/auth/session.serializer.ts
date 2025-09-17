import { Injectable } from '@nestjs/common'
import { PassportSerializer } from '@nestjs/passport'

@Injectable()
export class SessionSerializer extends PassportSerializer {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  serializeUser(user: unknown, done: (err: Error | null, user: unknown) => void): any {
    done(null, user)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  deserializeUser(payload: string, done: (err: Error | null, payload: string) => void): any {
    done(null, payload)
  }
}

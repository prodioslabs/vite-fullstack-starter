import { protectedProcedure, router } from '../../trpc'
import { getCurrentUser } from './user.service'

export const userRouter = router({
  getCurrentUser: protectedProcedure.query(() => getCurrentUser()),
})

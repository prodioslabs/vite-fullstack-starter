import { authContract } from './auth.contract'
import { client } from './client'
import { userContract } from './user.contract'

export const contract = client.router({
  auth: authContract,
  user: userContract,
})

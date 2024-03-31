import { client } from './client'
import { userContract } from './user.contract'

export const contract = client.router({
  user: userContract,
})

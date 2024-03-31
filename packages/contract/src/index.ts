import { client } from './client'
import { userContract } from './user'

export const contract = client.router({
  user: userContract,
})

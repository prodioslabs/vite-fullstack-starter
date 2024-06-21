import { authContract } from './auth.contract'
import { client } from './client'
import { fileContract } from './file.contract'
import { notificationContract, createNotificationSchema, notification } from './notification.contract'
import { userContract } from './user.contract'

export const contract = client.router({
  auth: authContract,
  user: userContract,
  notifications: notificationContract,
  file: fileContract,
})

export { createNotificationSchema, notification }

import { notificationContract } from './notification.contract'

export * from './auth.contract'
export * from './notification.contract'
export * from './file.contract'

export const contract = {
  notifications: notificationContract,
}

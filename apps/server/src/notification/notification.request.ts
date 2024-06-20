import { NestRequestShapes, NestResponseShapes } from '@ts-rest/nest'
import { contract } from '@repo/contract'

export type NotificationRequestShapes = NestRequestShapes<typeof contract.notifications>

export type NotificationResponseShapes = NestResponseShapes<typeof contract.notifications>

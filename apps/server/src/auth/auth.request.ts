import { contract } from '@repo/contract'
import { NestRequestShapes, NestResponseShapes } from '@ts-rest/nest'

export type AuthRequestShapes = NestRequestShapes<typeof contract.auth>

export type AuthResponseShapes = NestResponseShapes<typeof contract.auth>

import { contract } from '@repo/contract'
import { NestRequestShapes, NestResponseShapes } from '@ts-rest/nest'

export type FileRequestShapes = NestRequestShapes<typeof contract.file>

export type FileResponseShapes = NestResponseShapes<typeof contract.file>

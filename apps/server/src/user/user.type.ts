import { Prisma } from '@prisma/client'

export type UserWithoutSensitiveData = Prisma.UserGetPayload<{ select: typeof USER_SELECT_FIELDS }>

export const USER_SELECT_FIELDS = {
  id: true,
  email: true,
  name: true,
  role: true,
  password: false,
  salt: false,
} satisfies Prisma.UserSelect

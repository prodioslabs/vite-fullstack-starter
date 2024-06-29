import { cookies } from 'next/headers'
import { UserWithoutSensitiveData } from '@/server/context'

export async function getUser() {
  try {
    const _cookies = cookies()
    const response = await fetch(`${process.env.PAYLOAD_PUBLIC_SERVER_URL}/api/users/me`, {
      headers: { Cookie: _cookies.toString() },
    })
    const data: { user: UserWithoutSensitiveData | null } = await response.json()

    return data.user
  } catch (error) {
    return null
  }
}

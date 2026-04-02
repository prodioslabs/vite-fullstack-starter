import { uploadedFileSchema } from '@repo/contracts'

import { env } from './env'

export async function uploadFile(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch(new URL('/file/upload', env.VITE_API_BASE_URL), {
    method: 'POST',
    body: formData,
    credentials: 'include',
  })

  if (!res.ok) {
    throw new Error(`Error uploading file - ${res.status}`)
  }

  const json = await res.json()
  const parsed = uploadedFileSchema.safeParse(json)
  if (!parsed.success) {
    throw new Error('Invalid data')
  }

  return parsed.data
}

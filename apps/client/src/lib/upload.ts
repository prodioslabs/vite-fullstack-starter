import type { InferResponseType } from 'hono'

import { env } from './env'
import { getDataOrThrow, honoClient } from './hono'

export type FileData = InferResponseType<
  (typeof honoClient.api.file)['upload-file']['$post'],
  201
> &
  Record<string, unknown>

export function getUploadedFileUrl(
  file: Pick<FileData, 'bucket' | 'filename'>,
) {
  return `${env.VITE_API_BASE_URL}/api/file/${file.bucket}/${file.filename}`
}

export async function uploadFile(file: File) {
  return getDataOrThrow(
    honoClient.api.file['upload-file'].$post({ form: { file } }),
  )
}

export async function uploadImage(
  file: File,
  crop: {
    unit: '%' | 'px'
    width: number
    height: number
    x: number
    y: number
  },
) {
  return getDataOrThrow(
    honoClient.api.file['upload-image'].$post({
      form: {
        file,
        unit: crop.unit,
        width: crop.width.toString(),
        height: crop.height.toString(),
        x: crop.x.toString(),
        y: crop.y.toString(),
      },
    }),
  )
}

import type { InferResponseType } from 'hono'

import { getDataOrThrow, honoClient } from './hono'

export type FileData = InferResponseType<
  (typeof honoClient.api.file)['upload-file']['$post'],
  201
> &
  Record<string, unknown>

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

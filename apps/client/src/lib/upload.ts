export type FileData = { mimeType?: string; size?: number } & Record<
  string,
  any
>

export async function uploadFile(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  file: File,
): Promise<FileData> {
  throw new Error('not implemented')
}

export async function uploadImage(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  file: File,
  // TODO: update crop type
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  crop: unknown,
): Promise<FileData> {
  throw new Error('not implemented')
}

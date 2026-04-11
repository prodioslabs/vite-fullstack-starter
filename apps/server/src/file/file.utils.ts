import * as path from 'node:path'

import dayjs from 'dayjs'
import filenamify from 'filenamify'
import { Client as MinioClient, type ItemBucketMetadata } from 'minio'
import { customAlphabet } from 'nanoid'

import { env } from '../lib/env'

export const minioClient = new MinioClient({
  endPoint: env.S3_ENDPOINT,
  port: env.S3_PORT,
  useSSL: env.S3_USE_SSL,
  accessKey: env.S3_ACCESS_KEY,
  secretKey: env.S3_SECRET_KEY,
  region: env.S3_REGION,
})

export const ALLOWED_FILE_TYPES = [
  { mimeType: 'image/jpeg', extensions: ['jpg', 'jpeg'] },
  { mimeType: 'image/png', extensions: ['png'] },
  { mimeType: 'application/pdf', extensions: ['pdf'] },
  { mimeType: 'video/webm', extensions: ['webm'] },
  { mimeType: 'video/mp4', extensions: ['mp4'] },
  {
    mimeType:
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    extensions: ['xlsx'],
  },
  { mimeType: 'video/x-matroska', extensions: ['mkv', 'webm'] },
]

export function isValidFilename(filename: string) {
  // null byte attacks
  if (filename.includes('%00') || filename.includes('\0')) {
    return false
  }

  // directory traversal / path injection
  if (
    filename.includes('..') ||
    filename.includes('/') ||
    filename.includes('\\')
  ) {
    return false
  }

  // meta / special characters
  const unsafeChars = /[<>;:{}$`]/
  if (unsafeChars.test(filename)) {
    return false
  }

  // double extension (e.g., file.jpg.php or file.tar.gz)
  if ((filename.match(/\./g) || []).length > 1) {
    return false
  }

  return true
}

export function validateFileType(
  fileType: { mime: string; ext: string },
  file: File,
  allowedMimeTypes: { mimeType: string; extensions: string[] }[],
) {
  return allowedMimeTypes.some((allowedFileType) => {
    const incomingFileExtension = path
      .extname(file.name)
      .replace('.', '')
      .trim()
      .toLowerCase()

    return (
      fileType.mime === allowedFileType.mimeType &&
      allowedFileType.extensions.includes(fileType.ext) &&
      allowedFileType.extensions.includes(incomingFileExtension)
    )
  })
}

export function generateRandomFileId() {
  return customAlphabet(
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
    16,
  )
}

export const UPLOADED_FILES_ROOT_DIR_NAME = 'portal'

export async function uploadBuffer(
  buffer: Buffer,
  incomingFilename?: string,
  subPath = 'files',
  size?: number,
  metaData?: ItemBucketMetadata,
) {
  const bucket = env.S3_BUCKET

  const fileName = [
    generateRandomFileId(),
    incomingFilename ? sanitizeFileName(incomingFilename) : undefined,
  ]
    .filter(Boolean)
    .join('_')
  const objectName = [
    UPLOADED_FILES_ROOT_DIR_NAME,
    subPath,
    dayjs().format('DD-MM-YYYY'),
    fileName,
  ].join('/')

  await minioClient.putObject(bucket, objectName, buffer, size, metaData)
  return {
    bucket,
    objectName,
  }
}

export function sanitizeFileName(filename: string) {
  let sanitizedFileName = filenamify(filename)
  sanitizedFileName = sanitizedFileName
    .split(' ')
    .map((val) => val.replace(/[^a-zA-Z0-9.]/g, '_'))
    .join('')
  return sanitizedFileName
}

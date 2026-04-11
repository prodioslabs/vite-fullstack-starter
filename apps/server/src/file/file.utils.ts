import * as path from 'node:path'

import dayjs from 'dayjs'
import filenamify from 'filenamify'
import { tryGetContext } from 'hono/context-storage'
import { Client as MinioClient, type ItemBucketMetadata } from 'minio'
import { customAlphabet } from 'nanoid'
import sharp from 'sharp'

import { env } from '../lib/env'
import { logger } from '../lib/logger'

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

export const ALLOWED_IMAGE_TYPES = [
  { mimeType: 'image/jpeg', extensions: ['jpg', 'jpeg'] },
  { mimeType: 'image/png', extensions: ['png'] },
]

export const MAX_IMAGE_SIZE = 1000
export const MAX_FILE_SIZE_IN_BYTES = 200 * 1024 // 500KB
export const MAX_FILE_SIZE_IN_MB = 1024 * 1024 // 1MB

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

const generateRandomFileId = customAlphabet(
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  16,
)

export const UPLOADED_FILES_ROOT_DIR_NAME = 'portal'

export async function uploadBuffer(
  buffer: Buffer,
  incomingFilename?: string,
  subPath = 'files',
  size?: number,
  metaData?: ItemBucketMetadata,
) {
  const bucket = env.S3_BUCKET
  const component = 'uploadBuffer'
  const requestId = tryGetContext()?.var.requestId ?? 'unknown'

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

  logger.info(
    { requestId, component, objectName, bucket },
    'uploading file to bucket',
  )
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

export async function cropImage(
  fileBuffer: Buffer,
  crop: {
    unit: '%' | 'px'
    x: number
    y: number
    width: number
    height: number
  },
): Promise<Buffer> {
  const metadata = await sharp(fileBuffer).metadata()
  const {
    width: initialWidth = 0,
    height: initialHeight = 0,
    orientation = 1,
  } = metadata
  const { width, height } = getNormalSize({
    width: initialWidth,
    height: initialHeight,
    orientation,
  })
  const extractDimensions = {
    width:
      crop.unit === '%'
        ? Math.floor((width * crop.width) / 100)
        : Math.floor(crop.width),
    height:
      crop.unit === '%'
        ? Math.floor((height * crop.height) / 100)
        : Math.floor(crop.height),
    top:
      crop.unit === '%'
        ? Math.floor((height * crop.y) / 100)
        : Math.floor(crop.y),
    left:
      crop.unit === '%'
        ? Math.floor((width * crop.x) / 100)
        : Math.floor(crop.x),
  }
  const resizeWidth = Math.min(MAX_IMAGE_SIZE, extractDimensions.width)
  const croppedFileBuffer = await sharp(fileBuffer)
    .extract(extractDimensions)
    .rotate()
    .resize(resizeWidth)
    .toBuffer()
  return croppedFileBuffer
}

function getNormalSize({
  width,
  height,
  orientation,
}: {
  width: number
  height: number
  orientation: number
}) {
  // EXIF orientation values and their meanings:
  // 1 = Normal
  // 2 = Horizontal flip
  // 3 = 180° rotation
  // 4 = Vertical flip
  // 5 = Horizontal flip + 90° rotation clockwise
  // 6 = 90° rotation clockwise
  // 7 = Horizontal flip + 90° rotation counter-clockwise
  // 8 = 90° rotation counter-clockwise
  return (orientation || 0) >= 5
    ? { width: height, height: width }
    : { width, height }
}

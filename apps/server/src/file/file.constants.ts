export const MAX_IMAGE_SIZE = 1000
export const MAX_FILE_SIZE_IN_BYTES = 200 * 1024 // 500KB
export const MAX_FILE_SIZE_IN_MB = 1024 * 1024 // 1MB

export const ALLOWED_FILE_TYPES = [
  {
    mimeType: 'image/jpeg',
    extensions: ['jpg', 'jpeg'],
  },
  {
    mimeType: 'image/png',
    extensions: ['png'],
  },
  {
    mimeType: 'application/pdf',
    extensions: ['pdf'],
  },
  {
    mimeType: 'video/webm',
    extensions: ['webm'],
  },
  {
    mimeType: 'video/mp4',
    extensions: ['mp4'],
  },
  {
    mimeType:
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    extensions: ['xlsx'],
  },
  {
    mimeType: 'video/x-matroska',
    extensions: ['mkv', 'webm'],
  },
]

export const ALLOWED_IMAGE_MIMETYPES = [
  {
    mimeType: 'image/jpeg',
    extensions: ['jpg', 'jpeg'],
  },
  {
    mimeType: 'image/png',
    extensions: ['png'],
  },
]

export const ALLOWED_OFFLINE_USER_DOCUMENT_MIME_TYPES = [
  {
    mimeType: 'image/jpeg',
    extensions: ['jpg', 'jpeg'],
  },
  {
    mimeType: 'image/png',
    extensions: ['png'],
  },
  {
    mimeType: 'application/pdf',
    extensions: ['pdf'],
  },
]

export const UPLOADED_FILES_ROOT_DIR_NAME = 'portal'

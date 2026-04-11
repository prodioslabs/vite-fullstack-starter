import { zValidator } from '@hono/zod-validator'
import { fileTypeFromBuffer } from 'file-type'
import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import * as z from 'zod'

import { file as fileSchema } from '../db/schema'
import { db } from '../lib/db'
import { logger } from '../lib/logger'
import { authMiddleware } from '../middlewares/auth'

import {
  ALLOWED_FILE_TYPES,
  isValidFilename,
  minioClient,
  uploadBuffer,
  validateFileType,
} from './file.utils'

export const fileRouter = new Hono().post(
  'upload-file',
  authMiddleware,
  zValidator('form', z.object({ file: z.file() })),
  async function uploadFile(c) {
    const component = 'uploadFile'
    const requestId = c.get('requestId')
    const user = c.get('user')

    const file = c.req.valid('form').file
    if (!isValidFilename(file.name)) {
      throw new HTTPException(401, {
        message:
          'The file name is not allowed. Please rename the file and try again.',
      })
    }

    const fileArrayBuffer = await file.arrayBuffer()
    const fileType = await fileTypeFromBuffer(fileArrayBuffer)
    logger.debug({
      requestId,
      component,
      fileType,
      name: file.name,
    })

    if (!fileType) {
      throw new HTTPException(401, { message: 'Failed to get file type' })
    }

    if (!validateFileType(fileType, file, ALLOWED_FILE_TYPES)) {
      const allowedTypesDescription = ALLOWED_FILE_TYPES.map(
        ({ mimeType, extensions }) => `${mimeType} (${extensions.join(', ')})`,
      ).join('; ')

      throw new HTTPException(401, {
        message: `Invalid file type or extension. Allowed types and extensions: ${allowedTypesDescription}.`,
      })
    }

    if (file.type !== fileType.mime) {
      logger.warn(
        { requestId, component },
        `MIME mismatch detected. Sent=${file.type}, Actual=${fileType.mime}`,
      )
      throw new HTTPException(401, {
        message:
          'The selected file format is not supported. Please upload a valid file.',
      })
    }

    logger.info(
      { requestId, component, originalFilename: file.name },
      'uploading file to bucket',
    )
    const { bucket, objectName: filename } = await uploadBuffer(
      Buffer.from(fileArrayBuffer),
      file.name,
      'files',
      file.size,
      {
        'content-type': fileType.mime,
        'created-by': user.id,
        filename: file.name,
      },
    )
    logger.info(
      {
        requestId,
        component,
        uploadedFilename: filename,
        bucket,
        originalFilename: file.name,
      },
      'file uploaded successfully',
    )

    try {
      await db.insert(fileSchema).values({
        bucket,
        createdById: user.id,
        filename,
        mimeType: fileType.mime,
        size: file.size,
      })
      return c.json({ bucket, filename, mimeType: fileType.mime }, 201)
    } catch (error) {
      logger.error({ requestId, component, error }, 'error updating database')
      await minioClient.removeObject(bucket, filename)
      throw new HTTPException(500, { message: 'Error uploading file' })
    }
  },
)

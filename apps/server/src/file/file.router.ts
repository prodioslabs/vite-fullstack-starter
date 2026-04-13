import { Readable } from 'node:stream'

import { zValidator } from '@hono/zod-validator'
import { fileTypeFromBuffer } from 'file-type'
import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { stream } from 'hono/streaming'
import sharp from 'sharp'
import * as z from 'zod'

import { authMiddleware } from '../auth/auth.middleware'
import { file as fileSchema } from '../db/schema'
import { db } from '../lib/db'
import { logger } from '../lib/logger'

import {
  ALLOWED_FILE_TYPES,
  ALLOWED_IMAGE_TYPES,
  cropImage,
  isValidFilename,
  MAX_FILE_SIZE_IN_BYTES,
  MAX_IMAGE_SIZE,
  minioClient,
  uploadBuffer,
  validateFileType,
} from './file.utils'

export const fileRouter = new Hono()
  .get(
    '/:bucket/:filename{.+\\.*}',
    zValidator('param', z.object({ bucket: z.string(), filename: z.string() })),
    async function getFile(c) {
      const requestId = c.get('requestId')
      const component = 'getFile'

      const { bucket, filename } = c.req.param()
      logger.info({ requestId, component, bucket, filename }, 'fetching file')

      const objectMetadata = await minioClient
        .statObject(bucket, filename)
        .catch((error) => {
          logger.error(
            { error, requestId, component },
            'error getting file from bucket',
          )
          throw new HTTPException(404, { message: 'File not found' })
        })
      const contentType = objectMetadata.metaData['content-type']
      const sizeInByte = objectMetadata.size

      // sometimes the user uploads a large image
      // but I think the resizing should be done while uploading the file
      // TODO: figure out why this is done in this manner and update it
      let fileStream = await minioClient.getObject(bucket, filename)
      if (
        sizeInByte >= MAX_FILE_SIZE_IN_BYTES &&
        typeof contentType === 'string' &&
        contentType.startsWith('image/') &&
        contentType !== 'image/svg'
      ) {
        fileStream = fileStream.pipe(sharp().resize(MAX_IMAGE_SIZE))
      }

      c.res.headers.set('type', contentType)
      return stream(c, async function streamFile(stream) {
        fileStream.on('error', () => {
          stream.abort()
        })
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore temporarily disabled as the client typechecks are failing
        // TODO: create proper types for server and export it
        await stream.pipe(Readable.toWeb(fileStream))
      })
    },
  )
  .post(
    '/upload-file',
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
      logger.info({
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
          ({ mimeType, extensions }) =>
            `${mimeType} (${extensions.join(', ')})`,
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
  .post(
    '/upload-image',
    authMiddleware,
    zValidator(
      'form',
      z.object({
        file: z.file(),
        unit: z.enum(['%', 'px']),
        width: z.coerce.number(),
        height: z.coerce.number(),
        x: z.coerce.number(),
        y: z.coerce.number(),
      }),
    ),
    async function uploadImage(c) {
      const requestId = c.get('requestId')
      const component = 'uploadImage'
      const user = c.get('user')

      const { file, unit, width, height, x, y } = c.req.valid('form')

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

      if (!validateFileType(fileType, file, ALLOWED_IMAGE_TYPES)) {
        const allowedTypesDescription = ALLOWED_IMAGE_TYPES.map(
          ({ mimeType, extensions }) =>
            `${mimeType} (${extensions.join(', ')})`,
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

      const buffer = await cropImage(Buffer.from(fileArrayBuffer), {
        unit,
        width,
        height,
        x,
        y,
      })
      logger.info(
        { originalFilename: file.name, requestId, component },
        'image cropped successfully',
      )

      logger.info(
        { requestId, component, originalFilename: file.name },
        'uploading image to bucket',
      )
      const { bucket, objectName: filename } = await uploadBuffer(
        buffer,
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

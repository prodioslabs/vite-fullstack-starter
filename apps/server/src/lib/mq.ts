import {
  Queue,
  Worker,
  type Processor,
  type QueueOptions,
  type WorkerOptions,
} from 'bullmq'

import { logger } from './logger'
import { redisClient } from './redis'

export function createQueue<DataType = unknown>(
  queueName: string,
  options: Omit<QueueOptions, 'connection'> = {},
) {
  const queue = new Queue<DataType>(queueName, {
    ...options,
    connection: redisClient,
  })

  queue.on('error', (error) => {
    logger.error({ queueName, error }, 'error running queue')
  })

  logger.info({ queueName }, 'queue created')

  return queue
}

export function createWorker<
  DataType = unknown,
  ResultType = unknown,
  NameType extends string = string,
>(
  queueName: string,
  processor: Processor<DataType, ResultType, NameType>,
  options: Omit<WorkerOptions, 'connection'> = {},
) {
  const worker = new Worker<DataType, ResultType, NameType>(
    queueName,
    processor,
    { connection: redisClient, ...options },
  )

  worker.on('error', (error) => {
    logger.error({ error, queue: queueName }, 'error running worker')
  })

  worker.on('failed', (job, error) => {
    logger.error({ job, error, queue: queueName }, 'error running job')
  })

  logger.info({ queue: queueName }, 'worker created')

  return worker
}

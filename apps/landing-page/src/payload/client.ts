import configPromise from '@payload-config'
import type { InitOptions } from 'payload/config'
import { getPayload } from 'payload'
type GetPayloadClientOptions = Omit<InitOptions, 'config'>

/**
 * Gets the Payload client instance
 */
export async function getPayloadClient(options: GetPayloadClientOptions = {}) {
  return getPayload({
    config: configPromise,
    ...options,
  })
}

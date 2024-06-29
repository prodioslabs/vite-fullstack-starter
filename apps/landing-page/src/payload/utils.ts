import { Media } from './types'

export function getURLFromMedia(media: Media | string) {
  if (typeof media === 'string') {
    return media
  }

  return media.url!
}

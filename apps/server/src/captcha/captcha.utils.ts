import { tryGetContext } from 'hono/context-storage'
import { customAlphabet } from 'nanoid'
import sharp from 'sharp'

import { logger } from '../lib/logger'

export const captchaGenerator = customAlphabet(
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  6,
)

const FONT_SIZE = 24
const FONT_GAP = 15
const MARGIN = 10
const COLORS = ['#838e83', '#64403e', '#586a6a', '#dd6e42', '#16f4d0']
const NUM_RANDOM_LINES = 5

export async function createCaptchaImage({
  width,
  height,
  captcha,
}: {
  width: number
  height: number
  captcha: string
}) {
  const component = 'createCaptchaImage'
  const requestId = tryGetContext()?.get('requestId')

  const textElements: string[] = []
  let xPos = MARGIN
  for (let i = 0; i < captcha.length; i += 1) {
    const char = captcha[i]
    const charWidth = Math.floor(FONT_SIZE / 1.44)
    const yPos = Math.floor(random(-20, 20)) + (height + FONT_SIZE) / 2
    const rotation = random(-22.5, 22.5)
    const haveBlur = Math.random() > 0.8
    textElements.push(
      `<text x="${xPos}" y="${yPos}" font-size="${FONT_SIZE}" font-family="monospace" font-weight="bold" transform="rotate(${rotation}, ${xPos}, ${yPos})" fill="${pickRandom(COLORS)}" ${haveBlur ? 'filter="url(#blur)"' : ''}>${char}</text>`,
    )
    xPos = Math.min(width - MARGIN, xPos + charWidth + FONT_GAP)
  }

  const pathElements: string[] = []
  for (let i = 0; i < NUM_RANDOM_LINES; i += 1) {
    const start = generateRandomPoints(width, height)
    const cp1 = generateRandomPoints(width, height)
    const cp2 = generateRandomPoints(width, height)
    const end = generateRandomPoints(width, height)
    pathElements.push(
      `<path d="M ${start[0]} ${start[1]} C ${cp1[0]} ${cp1[1]} ${cp2[0]} ${cp2[1]} ${end[0]} ${end[1]}" fill="none" stroke="${pickRandom(COLORS)}" stroke-opacity="0.5"></path>`,
    )
  }

  const svg = `
  <svg viewBox="0 0 ${width} ${height}" width="${width}px" height="${height}px">
    <defs>
      <filter id="blur" x="0" y="0">
        <feGaussianBlur in="SourceGraphic" stdDeviation="1.75" />
      </filter>
    </defs>
    ${textElements.join('\n')}
    ${pathElements.join('\n')}
  </svg>`.trim()
  logger.info({ component, requestId }, 'generated svg')

  const png = await sharp(Buffer.from(svg))
    .png()
    .toBuffer()
    .catch((error) => {
      logger.error({ component, requestId, error }, 'error converting to png')
      throw error
    })
  logger.info({ component, requestId }, 'generated png')

  return png
}

function random(min: number, max: number) {
  return Math.random() * (max - min) + min
}

function pickRandom<T>(arr: T[]): T {
  const index = Math.floor(random(0, arr.length))
  return arr[index]!
}

function generateRandomPoints(width: number, height: number): [number, number] {
  return [Math.floor(random(0, width)), Math.floor(random(0, height))]
}

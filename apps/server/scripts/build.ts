import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

import { bunPluginPino } from './pino-plugin'

async function build() {
  const __dirname = path.dirname(fileURLToPath(import.meta.url))
  await Bun.build({
    entrypoints: [path.resolve(__dirname, '../src/index.ts')],
    outdir: path.resolve(__dirname, '../dist'),
    target: 'bun',
    sourcemap: true,
    plugins: [
      bunPluginPino({
        transports: ['pino-pretty', 'pino-loki'],
      }),
    ],
  })
}

build()

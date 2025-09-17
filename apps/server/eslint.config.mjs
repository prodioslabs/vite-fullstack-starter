import { default as defaultConfig } from '@repo/config/eslint.config.mjs'
import { defineConfig } from 'eslint/config'

export default defineConfig([...defaultConfig])

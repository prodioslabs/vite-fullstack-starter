import baseConfig, { TailwindConfig } from '@repo/config/tailwind.config'

const config = {
  ...baseConfig,
  content: ['./src/**/*.{js,jsx,tsx,ts}', './node_modules/@repo/ui/src/**/*.{js,jsx,ts,tsx}', ...baseConfig.content],
} satisfies TailwindConfig

export default config

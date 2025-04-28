import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { TanStackRouterVite } from '@tanstack/router-vite-plugin'
import { z } from 'zod'

// Get the base path from the environment variable
// Useful for hosting the app at a subpath
const base = z.string().default('/').parse(process.env.VITE_BUILD_BASE)

// https://vitejs.dev/config/
export default defineConfig({
  base,
  plugins: [react(), TanStackRouterVite()],
})

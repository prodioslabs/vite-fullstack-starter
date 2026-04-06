import { Hono } from 'hono'

export const app = new Hono()

export type App = typeof app

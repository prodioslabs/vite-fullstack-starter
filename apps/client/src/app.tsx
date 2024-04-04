import { RouterProvider, createRouter } from '@tanstack/react-router'

// Import the generated route tree
import { Toaster } from '@repo/ui'
import { routeTree } from './routeTree.gen'
import { queryClient } from './lib/client'

// Create a new router instance
const router = createRouter({ routeTree, context: { queryClient } })

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  )
}

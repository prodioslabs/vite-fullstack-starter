import { useMutation } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { authClient } from '@/lib/auth-client'
import { queryClient } from '@/lib/client'
import { getErrorMessage } from '@/lib/utils'

export const Route = createFileRoute('/_app/')({
  component: HomePage,
  pendingComponent: () => {
    return (
      <div className="min-h-screen flex items-center justify-center gap-2">
        <Spinner />
        <div className="text-xs text-muted-foreground">Loading...</div>
      </div>
    )
  },
  errorComponent: ({ error, reset }) => (
    <div className="p-4 space-y-2">
      <div className="text-sm text-destructive">{error.message}</div>
      <Button variant="outline" size="sm" onClick={reset}>
        Retry
      </Button>
    </div>
  ),
})

function HomePage() {
  const navigate = useNavigate()
  const session = authClient.useSession()

  const signOutMutation = useMutation({
    mutationFn: () => {
      return authClient.signOut()
    },
    onSuccess: () => {
      toast.success('Signed out successfully')
      queryClient.clear()
      navigate({ to: '/login', replace: true })
    },
    onError: (error) => {
      const errorMessage = getErrorMessage(error)

      toast.error('Failed to sign out', {
        description: errorMessage,
      })
    },
  })

  return (
    <div className="p-4">
      <h1 className="text-xl font-medium mb-4">Home</h1>
      <div className="border rounded-md p-4 max-w-md space-y-3">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Logged in as</p>
          <p className="text-sm font-medium">{session.data?.user.email}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            loading={session.isPending}
            onClick={() => {
              session.refetch()
            }}
          >
            Refetch
          </Button>
          <Button
            variant="outline"
            size="sm"
            loading={signOutMutation.isPending}
            onClick={() => {
              signOutMutation.mutate()
            }}
          >
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  )
}

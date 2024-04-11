import { createLazyFileRoute } from '@tanstack/react-router'
import { match } from 'ts-pattern'
import { Button } from '@repo/ui'
import { useCurrentUser } from '../../hooks/use-current-user'

export const Route = createLazyFileRoute('/_app/')({
  component: Home,
})

function Home() {
  const currentUserQuery = useCurrentUser()

  return (
    <div className="p-4">
      <div className="text-xl font-medium mb-2">Home</div>
      <div className="items-center space-y-2 border rounded-md p-3 max-w-screen-md">
        <div className="flex-1 text-sm">
          Current User -{' '}
          {match(currentUserQuery)
            .returnType<string>()
            .with({ status: 'pending' }, () => 'Loading...')
            .with(
              { status: 'success' },
              ({ data: { body: currentUser } }) => `${currentUser.user.name} (${currentUser.user.email})`,
            )
            .with({ status: 'error' }, () => 'Error')
            .exhaustive()}
        </div>
        <Button
          loading={currentUserQuery.isLoading}
          onClick={() => {
            currentUserQuery.refetch()
          }}
          variant="outline"
        >
          Refetch Current User
        </Button>
      </div>
    </div>
  )
}

import { createLazyFileRoute } from '@tanstack/react-router'
import { match } from 'ts-pattern'
import { Button } from '@repo/ui'
import { client } from '../../lib/client'

export const Route = createLazyFileRoute('/_app/')({
  component: Home,
})

function Home() {
  const getCurrentUserQuery = client.user.getCurrentUser.useQuery(['user', 'current'])
  return (
    <div className="p-4">
      <div className="text-3xl font-medium mb-2">Home</div>
      <div className="items-center space-y-2 border rounded-md p-3 max-w-screen-md">
        <div className="flex-1 text-sm">
          Current User -{' '}
          {match(getCurrentUserQuery)
            .returnType<string>()
            .with({ status: 'pending' }, () => 'Loading...')
            .with(
              { status: 'success' },
              ({ data: { body: currentUser } }) => `${currentUser.name} (${currentUser.email})`,
            )
            .with({ status: 'error' }, () => 'Error')
            .exhaustive()}
        </div>
        <Button
          loading={getCurrentUserQuery.isLoading}
          onClick={() => {
            getCurrentUserQuery.refetch()
          }}
        >
          Refetch Current User
        </Button>
      </div>
    </div>
  )
}

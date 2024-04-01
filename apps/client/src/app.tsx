import { Button } from '@repo/ui'
import { match } from 'ts-pattern'
import { client } from './lib/client'

export default function App() {
  const getCurrentUserQuery = client.user.getCurrentUser.useQuery(['user', 'current'])

  return (
    <div className="p-4">
      <div className="text-3xl font-medium mb-2">User Info</div>
      <div className="flex items-center gap-3">
        <div className="flex-1">
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

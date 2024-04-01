import { client } from './lib/client'

export default function App() {
  const getCurrentUserQuery = client.user.getCurrentUser.useQuery(['user', 'current'])
  const currentUser = getCurrentUserQuery.data?.body

  return (
    <div>
      Client App
      {currentUser ? (
        <div>
          Current User - {currentUser.name} ({currentUser.email})
        </div>
      ) : null}
    </div>
  )
}

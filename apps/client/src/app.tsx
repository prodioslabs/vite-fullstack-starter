import { client } from './lib/client'

export default function App() {
  const getCurrentUserQuery = client.user.getCurerentUser.useQuery(['user', 'current'])
  console.log(getCurrentUserQuery.data?.body)
  return <div>Client App</div>
}

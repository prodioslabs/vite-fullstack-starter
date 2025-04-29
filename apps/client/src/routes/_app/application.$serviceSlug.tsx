import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/application/$serviceSlug')({
  component: Application,
})

function Application() {
  const params = Route.useParams()

  return (
    <div className="p-4">
      <div className="text-xl font-medium mb-2">{params._splat}</div>
    </div>
  )
}

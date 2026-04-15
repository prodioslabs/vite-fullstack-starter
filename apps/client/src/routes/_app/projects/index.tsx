import { createFileRoute } from '@tanstack/react-router'
import { LayersIcon } from 'lucide-react'

import { PageHeader } from '@/components/ui/page-header'

export const Route = createFileRoute('/_app/projects/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <PageHeader
        icon={<LayersIcon />}
        title="All Projects"
        description="All projects assigned to you"
      />
    </div>
  )
}

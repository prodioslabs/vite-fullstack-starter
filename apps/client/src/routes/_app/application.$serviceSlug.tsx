import { Button, ErrorMessage } from '@repo/ui'
import { createFileRoute } from '@tanstack/react-router'
import { SaveIcon } from 'lucide-react'
import { match } from 'ts-pattern'
import { SERVICE_CONFIGS } from '../../service-configs'
import StepperForm from '../../components/stepper-form'
import CommonForm from '../../components/common-form'

export const Route = createFileRoute('/_app/application/$serviceSlug')({
  component: Application,
})

function Application() {
  const serviceSlug = Route.useParams().serviceSlug
  const serviceConfig = SERVICE_CONFIGS[serviceSlug]

  if (!serviceConfig) {
    return <ErrorMessage title="Service not found" />
  }

  return (
    <div className="p-4">
      <div className="text-xl font-medium mb-2">{serviceConfig.name} </div>

      {match(serviceConfig)
        .with({ type: 'common-form' }, (config) => <CommonForm formConfig={config} />)
        .with({ type: 'stepper-form' }, (config) => <StepperForm formConfig={config} />)
        .exhaustive()}

      <div className="flex items-center gap-4">
        <Button icon={<SaveIcon />} variant="outline" type="button">
          Save
        </Button>
        <Button type="submit">Submit</Button>
      </div>
    </div>
  )
}

import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod/src/zod.js'
import { Button, cn, Form } from '@repo/ui'
import { StepperFormConfig } from '../../types/service'
import SubForms from '../sub-forms'

type StepperFormProps = {
  className?: string
  style?: React.CSSProperties
  formConfig: StepperFormConfig
}

export default function StepperForm({ className, style, formConfig }: StepperFormProps) {
  const [activeStepIndex, setActiveStepIndex] = useState(0)

  const activeStep = formConfig.steps[activeStepIndex]

  const totalSteps = formConfig.steps.length

  const form = useForm({
    resolver: zodResolver(activeStep.validationSchema),
    defaultValues: formConfig.initialValues,
    mode: 'all',
  })

  const goToPreviousStep = () => {
    if (activeStepIndex > 0) {
      setActiveStepIndex(activeStepIndex - 1)
    }
  }

  const goToNextStep = () => {
    if (activeStepIndex < totalSteps - 1) {
      setActiveStepIndex(activeStepIndex + 1)
    }
  }

  return (
    <div className={cn('grid gap-4 md:grid-cols-3', className)} style={style}>
      <div>
        {formConfig.steps.map((step, index) => (
          <div key={step.id} className="flex gap-2">
            <div
              className={cn(
                'p-4 w-4 text-white rounded-2xl',
                index === activeStepIndex ? 'bg-primary' : 'bg-gray-200 text-gray-500',
              )}
            />
            <span> {step.name}</span>
          </div>
        ))}
      </div>
      <div className="md:col-span-2">
        <Form {...form}>
          <form>
            <SubForms subforms={activeStep.subforms} />

            <div className="my-4">
              {Object.keys(form.formState.errors).length > 0 ? (
                <div className="p-2 rounded-md bg-red-50 text-red-400 border-[1px] border-red-400">
                  <p className="font-semibold">Please rectify errors in following fields</p>
                  <p className="text-sm truncate">{Object.keys(form.formState.errors).join(', ')}</p>
                </div>
              ) : null}
            </div>

            <div className="space-x-2">
              <Button type="button" onClick={goToPreviousStep} disabled={activeStepIndex === 0}>
                Previus
              </Button>
              <Button type="button" onClick={goToNextStep} disabled={activeStepIndex === totalSteps - 1}>
                Next
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}

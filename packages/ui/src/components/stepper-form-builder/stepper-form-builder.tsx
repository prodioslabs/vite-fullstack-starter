import { DefaultValues, FieldValues, UseFormReturn } from 'react-hook-form'
import { useState } from 'react'
import { Button } from '../ui/button'
import { StepForm, StepperForm } from './types'
import { Stepper } from '../stepper/stepper'
import { FormBuilder } from '../form-builder'

type StepperFormBuilderProps<TFieldValues extends FieldValues> = {
  config: StepperForm<TFieldValues>
  defaultValues: DefaultValues<TFieldValues>
  onSubmit: (value: TFieldValues) => void
  submitButtonProps?: React.ComponentProps<typeof Button>
  extraActions?: (form: UseFormReturn<TFieldValues>) => React.ReactNode
}

export function StepperFormBuilder<TFieldValues extends FieldValues>({
  config,
  defaultValues,
  onSubmit,
}: StepperFormBuilderProps<TFieldValues>) {
  const [activeStepIndex, setActiveStepIndex] = useState(0)
  const [formData, setFormData] = useState(defaultValues as TFieldValues)

  const currentStepConfig = config.steps[config.stepOrder[activeStepIndex]] as StepForm

  const handleNext = () => {
    if (activeStepIndex < config.stepOrder.length - 1) {
      setActiveStepIndex((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    if (activeStepIndex > 0) {
      setActiveStepIndex((prev) => prev - 1)
    }
  }

  const handleFinish = () => {
    if (activeStepIndex === config.stepOrder.length - 1) {
      onSubmit(formData)
      window.alert('Form submitted')
    }
  }

  const stepsTitleAndDescription = Object.fromEntries(
    config.stepOrder.map((stepId) => {
      const step = config.steps[stepId]
      return [stepId, { title: step.name, description: step.description }]
    }),
  )

  const stepStatus = Object.fromEntries(
    config.stepOrder.map((stepId, index) => [
      stepId,
      index === activeStepIndex ? 'active' : index < activeStepIndex ? 'completed' : 'not-started',
    ]),
  )

  return (
    <div className="grid grid-cols-4 gap-6">
      <Stepper
        steps={stepsTitleAndDescription as TFieldValues}
        stepsOrder={config.stepOrder}
        stepStatus={stepStatus}
        className="col-span-1"
      />
      <FormBuilder
        config={currentStepConfig.form}
        defaultValues={{}}
        onSubmit={(value) => {
          setFormData((prev) => ({ ...prev, ...value }))

          if (activeStepIndex < config.stepOrder.length - 1) {
            handleNext()
          } else {
            handleFinish()
          }
        }}
        className="col-span-3"
        extraActions={() => {
          return (
            <>
              <Button variant="outline" type="button" onClick={handleBack}>
                Prev
              </Button>
              <div className="flex-1" />
            </>
          )
        }}
        submitButtonProps={{
          children: activeStepIndex === config.stepOrder.length - 1 ? 'Finish' : 'Next',
        }}
      />
    </div>
  )
}

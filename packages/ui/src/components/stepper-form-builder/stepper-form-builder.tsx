import { FieldValues, UseFormReturn } from 'react-hook-form'
import { useCallback, useMemo, useState } from 'react'
import { Button } from '../ui/button'
import { StepForm, StepperForm } from './types'
import { Stepper, StepStatus } from '../stepper'
import { FormBuilder } from '../form-builder'
import { cn } from '../../lib/utils'

type StepperFormBuilderProps<TFieldValues extends FieldValues> = {
  config: StepperForm<TFieldValues>
  defaultValues: TFieldValues
  onSubmit: (value: TFieldValues) => void
  submitButtonProps?: React.ComponentProps<typeof Button>
  extraActions?: (form: UseFormReturn<TFieldValues>) => React.ReactNode
  className?: string
  style?: React.CSSProperties
}

export function StepperFormBuilder<TFieldValues extends FieldValues>({
  config,
  defaultValues,
  onSubmit,
  className,
  style,
}: StepperFormBuilderProps<TFieldValues>) {
  const [activeStepIndex, setActiveStepIndex] = useState(0)
  const [formData, setFormData] = useState<TFieldValues>(defaultValues)

  const stepOrder = useMemo(
    () => {
      if (typeof config.stepOrder === 'function') {
        return config.stepOrder(formData)
      }
      return config.stepOrder
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [formData, config.stepOrder],
  )

  const currentStepConfig = config.steps[stepOrder[activeStepIndex]] as StepForm

  const handleBack = useCallback(() => {
    if (activeStepIndex > 0) {
      setActiveStepIndex((prev) => prev - 1)
    }
  }, [activeStepIndex])

  const handleNext = useCallback(
    (value: Partial<TFieldValues>) => {
      setFormData((prev) => ({ ...prev, ...value }))
      if (activeStepIndex < config.stepOrder.length - 1) {
        setActiveStepIndex((prev) => prev + 1)
      }
    },
    [activeStepIndex, config.stepOrder.length],
  )

  const handleFinish = useCallback(
    (value: Partial<TFieldValues>) => {
      setFormData((prev) => ({ ...prev, ...value }))
      if (activeStepIndex === config.stepOrder.length - 1) {
        onSubmit({ ...formData, ...value })
      }
    },
    [activeStepIndex, config.stepOrder.length, formData, onSubmit],
  )

  const stepsTitleAndDescription = Object.fromEntries(
    stepOrder.map((stepId) => {
      const step = config.steps[stepId]
      return [stepId, { title: step.name, description: step.description }]
    }),
  )

  const stepStatus = Object.fromEntries(
    stepOrder.map((stepId, index) => [
      stepId,
      index === activeStepIndex ? 'active' : index < activeStepIndex ? 'completed' : 'not-started',
    ]),
  ) as Record<keyof TFieldValues, StepStatus>

  return (
    <div className={cn('grid grid-cols-4 gap-12 divide-x', className)} style={style}>
      <Stepper
        steps={stepsTitleAndDescription as TFieldValues}
        stepsOrder={stepOrder}
        stepStatus={stepStatus}
        className="col-span-1 py-6"
      />
      <FormBuilder
        config={currentStepConfig.form}
        defaultValues={{}}
        onSubmit={(value) => {
          if (activeStepIndex < config.stepOrder.length - 1) {
            handleNext(value as Partial<TFieldValues>)
          } else {
            handleFinish(value as Partial<TFieldValues>)
          }
        }}
        className="col-span-3 pl-12"
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

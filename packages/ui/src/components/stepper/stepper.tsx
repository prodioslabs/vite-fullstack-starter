import { CheckIcon } from 'lucide-react'
import { cn } from '../../lib/utils'

type Steps = Record<string, Step>

type StepperProps<TSteps extends Steps = Steps> = {
  steps: TSteps
  stepsOrder: (keyof TSteps)[]
  stepStatus: Record<keyof TSteps, StepStatus>
}

type Step = {
  title: string
  description?: string
}

type StepStatus = 'completed' | 'active' | 'not-started'

export function Stepper<TSteps extends Steps = Steps>({ steps, stepsOrder, stepStatus }: StepperProps<TSteps>) {
  return (
    <div className={cn('flex flex-col relative')}>
      {stepsOrder.map((stepId, index) => {
        const step = steps[stepId]
        const status = stepStatus[stepId]

        return (
          <div
            key={stepId}
            className={cn(
              'flex items-start gap-4 relative min-w-max',
              index !== stepsOrder.length - 1 ? 'pb-8' : undefined,
            )}
          >
            <div
              className={cn('h-7 w-7 rounded-full flex items-center justify-center border-2 relative z-10', {
                'bg-primary text-primary-foreground  border-primary': status === 'completed',
                'border-primary bg-background': status === 'active',
                'border-border bg-background text-foreground': status === 'not-started',
              })}
            >
              {status === 'completed' ? (
                <CheckIcon className="h-4 w-4 text-current" />
              ) : status === 'active' ? (
                <div className="w-2 h-2 rounded-full bg-primary" />
              ) : null}
            </div>
            <div
              className={cn({
                'text-primary': status === 'active',
                'text-foreground': status === 'not-started',
              })}
            >
              <div className="font-medium text-sm">{step.title}</div>
              {step.description ? (
                <div className="text-sm text-muted-foreground max-w-sm">{step.description}</div>
              ) : null}
            </div>
            {index !== stepsOrder.length - 1 ? (
              <div
                className={cn(
                  'absolute border h-full left-3.5 top-0 -translate-x-1/2',
                  status === 'completed' ? 'border-primary' : 'border-border',
                )}
              />
            ) : null}
          </div>
        )
      })}
    </div>
  )
}

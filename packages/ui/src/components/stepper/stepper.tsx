import { CheckIcon } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { cn } from '../../lib/utils'

type Steps = Record<string, Step>

type StepperProps<TSteps extends Steps = Steps> = {
  steps: TSteps
  stepsOrder: (keyof TSteps)[]
  stepStatus: Record<keyof TSteps, StepStatus>
  onStepClick?: (stepId: keyof TSteps) => void
  className?: string
  style?: React.CSSProperties
}

type Step = {
  title: string
  description?: string
}

export type StepStatus = 'completed' | 'active' | 'not-started'

export function Stepper<TSteps extends Steps = Steps>({
  steps,
  stepsOrder,
  stepStatus,
  onStepClick,
  className,
  style,
}: StepperProps<TSteps>) {
  return (
    <>
      <div className={cn('hidden md:flex flex-col relative', className)} style={style}>
        {stepsOrder.map((stepId, index) => {
          const step = steps[stepId]
          const status = stepStatus[stepId]
          return (
            <div
              key={String(stepId)}
              className={cn(
                'flex items-start gap-4 relative',
                index !== stepsOrder.length - 1 ? 'pb-8' : undefined,
                onStepClick ? 'cursor-pointer' : undefined,
              )}
              onClick={() => {
                onStepClick?.(String(stepId))
              }}
            >
              <div
                className={cn(
                  'h-7 w-7 rounded-full flex-shrink-0 flex items-center justify-center border-2 relative z-10',
                  {
                    'bg-primary text-primary-foreground  border-primary': status === 'completed',
                    'border-primary bg-background': status === 'active',
                    'border-border bg-background text-foreground': status === 'not-started',
                  },
                )}
              >
                {status === 'completed' ? (
                  <CheckIcon className="h-3.5 w-3.5 text-current" strokeWidth={2.5} />
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
                <div className="font-medium text-sm mt-1">{step.title}</div>
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

      {/* This is the mobile version of the stepper */}
      <div className={cn('md:hidden z-10 w-full border-b py-4', className)} style={style}>
        <div className="text-sm text-muted-foreground mb-4">To navigate between steps, use the dropdown below</div>

        <Select
          value={String(stepsOrder.find((stepId) => stepStatus[stepId] === 'active'))}
          onValueChange={(stepId) => {
            onStepClick?.(String(stepId))
          }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {stepsOrder.map((stepId, index) => {
              const step = steps[stepId]
              return (
                <SelectItem value={String(stepId)} key={String(stepId)}>
                  {`${index + 1}. ${step.title}`}
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </div>
    </>
  )
}

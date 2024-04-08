import { cn } from '@repo/ui'
import { CheckIcon } from 'lucide-react'

type Step = {
  title: string
  description?: string
}

type CustomStepsProps = {
  steps: Step[]
  currentStep: number
  direction?: 'horizontal' | 'vertical'
}

export default function Steps({ steps, currentStep, direction = 'horizontal' }: CustomStepsProps) {
  const renderSteps = () => {
    return steps.map((step, index) => {
      const isCurrentStep = index === currentStep
      const isCompletedStep = index < currentStep

      return (
        <div key={index} className={cn('flex items-center', direction === 'vertical' ? 'mb-4' : 'mr-4')}>
          <div
            className={cn('h-6 w-6 rounded-full flex items-center justify-center border-2', {
              'bg-blue-500 border-blue-500': isCurrentStep,
              'bg-green-500 border-green-500': isCompletedStep,
              'border-gray-300': !isCurrentStep && !isCompletedStep,
            })}
          >
            {isCompletedStep ? (
              <CheckIcon className="h-4 w-4 text-white" />
            ) : (
              <span className="text-white">{index + 1}</span>
            )}
          </div>
          <div className={cn('ml-3', { 'text-blue-500': isCurrentStep, 'text-gray-700': !isCurrentStep })}>
            <h3 className="font-medium">{step.title}</h3>
            {step.description && <p className="text-sm text-gray-500">{step.description}</p>}
          </div>
        </div>
      )
    })
  }

  return <div className={cn('flex', direction === 'vertical' ? 'flex-col' : 'space-x-4')}>{renderSteps()}</div>
}

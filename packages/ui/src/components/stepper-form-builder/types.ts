import { FormConfig } from '../form-builder'

export type StepForm = {
  name: string
  description?: string
  form: FormConfig
}

export type StepsForm = Record<string, StepForm>

export type StepperForm<TSteps extends StepsForm = StepsForm> = {
  steps: TSteps
  stepOrder: (keyof TSteps)[]
}

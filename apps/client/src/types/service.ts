import { FieldValues } from 'react-hook-form'
import { z } from 'zod'
import { Field } from './field'

type ServiceInitialValues = Record<string, string | number | boolean | Date | undefined | null>

type BaseConfig = {
  id: string
  name: string
  initialValues?: ServiceInitialValues
}

export type CommonFormConfig = BaseConfig & {
  type: 'common-form'
  subforms: Array<SubformConfig>
  validationSchema?: z.ZodType
}

export type SubformConfig = {
  id: string
  name: string
  description?: string
  hidden?: boolean | ((values: FieldValues) => boolean)
  fields: Array<Field>
}

export type StepperFormConfig = BaseConfig & {
  type: 'stepper-form'
  steps: Array<StepConfig>
}

export type StepConfig = {
  id: string
  name: string
  hidden?: boolean | ((values: FieldValues) => boolean)
  subforms: Array<SubformConfig>
  validationSchema: z.ZodType
}

export type ServiceConfig = CommonFormConfig | StepperFormConfig

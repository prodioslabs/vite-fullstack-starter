import { z } from 'zod'
import { FieldValues, UseFormSetValue } from 'react-hook-form'

export type FormConfig = {
  subforms: SubformConfig[]
  validationSchema: z.ZodType
}

export type SubformConfig = {
  id: string
  name: string
  description?: string
  hidden?: boolean | ((values: FieldValues) => boolean)
  fields: Field[]
}

type BaseField = {
  id: string
  name: string
  description?: string
  className?: string
  required?: boolean
  hidden?: boolean | ((values: FieldValues) => boolean)
  disabled?: boolean | ((values: FieldValues) => boolean)
  onChange?: (values: FieldValues, setValues: UseFormSetValue<Record<string, unknown>>) => void
  maxLength?: number
  placeholder?: string
  canOfficerModify?: boolean
}

export type StepperForm = {
  steps: {
    [stepId: string]: {
      name: string
      description?: string
      form: FormConfig
    }
  }
  stepOrder: string[]
}

export type Option = {
  name: string
  value: string
  description?: string
}
export type Options = Option[] | ((values: FieldValues) => Option[])

export type TextField = BaseField & {
  type: 'text'
  placeholder?: string
}

export type TextareaField = BaseField & {
  type: 'textarea'
  placeholder?: string
}

export type NumberField = BaseField & {
  type: 'number'
}

export type CheckboxField = BaseField & {
  type: 'checkbox'
}

export type RadioField = BaseField & {
  type: 'radio'
  options: Options
  layout?: 'horizontal' | 'vertical'
}

export type DateField = BaseField & {
  type: 'date'
  disabledDate?: ((date: Date, values: FieldValues) => boolean) | undefined
}

export type SelectField = BaseField & {
  type: 'select'
  options: Options
}

export type EmailField = BaseField & {
  type: 'email'
}

export type MultiCheckboxField = BaseField & {
  type: 'multi-checkbox'
  options: Options
}

export type Field =
  | CheckboxField
  | DateField
  | EmailField
  | MultiCheckboxField
  | NumberField
  | RadioField
  | SelectField
  | TextareaField
  | TextField
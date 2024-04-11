import { z } from 'zod'
import { FieldValues, UseFormSetValue } from 'react-hook-form'

export type FormConfig<TFieldValues extends FieldValues = FieldValues> = {
  subforms: SubformConfig[]
  validationSchema: z.ZodType<TFieldValues>
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
  isNameHidden?: boolean
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

export type Option = {
  name: string
  value: string
  description?: string
}
export type Options = Option[] | ((values: FieldValues) => Option[])

export type TextField = BaseField & {
  type: 'text'
  placeholder?: string
  inputType?: React.ComponentProps<'input'>['type']
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
  label?: string
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

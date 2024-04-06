import { FieldValues, UseFormSetValue } from 'react-hook-form'

type BaseField = {
  id: string
  name: string
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
  id: string
  name: string
  value: string
}
export type Options = Option[] | ((values: FieldValues) => Option[])

export type TextField = BaseField & {
  type: 'text'
}

export type TextareaField = BaseField & {
  type: 'textarea'
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

export type Field =
  | TextField
  | TextareaField
  | NumberField
  | CheckboxField
  | RadioField
  | DateField
  | SelectField
  | EmailField

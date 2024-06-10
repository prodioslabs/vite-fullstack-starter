import { z } from 'zod'
import { FormRef } from './form'
import { BaseValidationSchema, Option } from './schema'

export type FieldConfig<ValidationSchema extends BaseValidationSchema> =
  | StringField<ValidationSchema>
  | NumberField<ValidationSchema>
  | DateField<ValidationSchema>
  | SelectField<ValidationSchema>
  | CheckboxField<ValidationSchema>
  | RadioField<ValidationSchema>
  | MultiCheckboxField<ValidationSchema>
  | FileField<ValidationSchema>
  | ObjectField<ValidationSchema>
  | AsyncSelectField<ValidationSchema>
  | HeadingField<ValidationSchema>
  | ComboboxField<ValidationSchema>
  | DataQueryActionField<ValidationSchema>
  | MultiSelectField<ValidationSchema>
  | AsyncComboboxField<ValidationSchema>

type StringField<ValidationSchema extends BaseValidationSchema> = BaseField<ValidationSchema> & {
  type: 'string'
  inputType?: 'text' | 'email' | 'password' | 'textarea'
  placeholder?: string
  maxLength?: number
}

type NumberField<ValidationSchema extends BaseValidationSchema> = BaseField<ValidationSchema> & {
  type: 'number'
}

type DateField<ValidationSchema extends BaseValidationSchema> = BaseField<ValidationSchema> & {
  type: 'date'
  placeholder?: string
}

type SelectField<ValidationSchema extends BaseValidationSchema> = BaseField<ValidationSchema> & {
  type: 'select'
  options: Option[] | ((formData: z.infer<ValidationSchema>) => Option[])
  allowClear?: boolean
  placeholder?: string
}

type ComboboxField<ValidationSchema extends BaseValidationSchema> = BaseField<ValidationSchema> & {
  type: 'combobox'
  options: Option[] | ((formData: z.infer<ValidationSchema>) => Option[])
  placeholder?: string
}

type CheckboxField<ValidationSchema extends BaseValidationSchema> = BaseField<ValidationSchema> & {
  type: 'checkbox'
  label?: {
    en: RichText | RichText[]
    [lang: string]: RichText | RichText[]
  }
}

type RadioField<ValidationSchema extends BaseValidationSchema> = BaseField<ValidationSchema> & {
  type: 'radio'
  options: Option[] | ((formData: z.infer<ValidationSchema>) => Option[])
  layout?: 'horizontal' | 'vertical'
}

type MultiCheckboxField<ValidationSchema extends BaseValidationSchema> = BaseField<ValidationSchema> & {
  type: 'multi-checkbox'
  options: Option[] | ((formData: z.infer<ValidationSchema>) => Option[])
}

type FileField<ValidationSchema extends BaseValidationSchema> = BaseField<ValidationSchema> & {
  type: 'file'
  fileDescription?: string
  notes?: [
    {
      id: string
      type: 'html'
      en: string
      [lang: string]: string
    },
  ]
}

type HeadingField<ValidationSchema extends BaseValidationSchema> = BaseField<ValidationSchema> & {
  type: 'heading'
}

type InferNestedZodObject<T, K> =
  T extends z.ZodObject<infer U>
    ? K extends keyof U
      ? U[K] extends BaseValidationSchema
        ? U[K]
        : U[K] extends z.ZodArray<infer V>
          ? V extends BaseValidationSchema
            ? V
            : any
          : any
      : any
    : any

type ObjectField<ValidationSchema extends BaseValidationSchema> = BaseField<ValidationSchema> & {
  type: 'object'
  fields: FieldConfig<InferNestedZodObject<ValidationSchema, ObjectField<ValidationSchema>['id']>>[]
}

export type AsyncSelectField<ValidationSchema extends BaseValidationSchema> = BaseField<ValidationSchema> & {
  type: 'async-select'
  allowClear?: boolean
  placeholder?: string
  /**
   * Keys of fields on which your `async-select` depends.
   * If any of the field in dependency is changed, then your
   * query will be re-executed.
   */
  dependencies?: Array<keyof z.infer<ValidationSchema>>
  query: {
    /**
     * Your API endpoint to get options from.
     * This must be a GET endpoint and must return an array.
     */
    url: string | ((formData: z.infer<ValidationSchema>) => string)
    /**
     * Weather the query is enabled to execute.
     */
    enabled?: boolean | ((formData: z.infer<ValidationSchema>) => boolean)
  }
  options?: {
    /**
     * Key to access label from the response form API.
     * This key can be nested.
     *
     * @example
     * labelKey: 'user.name' or 'userName'
     */
    labelKey?: string
    /**
     * Key to access the value used for select from API.
     * This key can be nested.
     *
     * @example
     * valueKey: 'user.id' or 'userId'
     */
    valueKey?: string
  }
}

type BaseField<ValidationSchema extends BaseValidationSchema> = {
  id: keyof z.infer<ValidationSchema>
  name: {
    en: string
    [lang: string]: string
  }
  description?: {
    en: string
    [lang: string]: string
  }
  tooltip?: {
    en: string
    [lang: string]: string
  }
  onChange?: (form: FormRef<ValidationSchema>) => void
  hidden?: boolean | ((formData: z.infer<ValidationSchema>) => boolean)
  disabled?: boolean | ((formData: z.infer<ValidationSchema>) => boolean)
  multiple?: boolean
  multipleView?: 'list' | 'table'
  colSpan?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  required?: boolean
  isNameHidden?: boolean
}

export type RichText =
  | string
  | {
      type: 'info'
      content: string
      info: string
    }

export type DataQueryActionField<
  ValidationSchema extends BaseValidationSchema,
  QueryData extends any = any,
> = BaseField<ValidationSchema> & {
  type: 'action'
  id: string
  label: {
    en: string
  }
  queryFn: (formData: z.infer<ValidationSchema>) => Promise<QueryData>
  onQuerySuccess?: (formRef: FormRef<ValidationSchema>, data: QueryData) => void
  onQueryError?: (formRef: FormRef<ValidationSchema>, error: Error) => void
}

type MultiSelectField<ValidationSchema extends BaseValidationSchema> = BaseField<ValidationSchema> & {
  type: 'multi-select'
  options: Option[] | ((formData: z.infer<ValidationSchema>) => Option[])
}

export type AsyncComboboxField<ValidationSchema extends BaseValidationSchema> = BaseField<ValidationSchema> & {
  type: 'async-combobox'
  allowClear?: boolean
  placeholder?: string
  dependencies?: Array<keyof z.infer<ValidationSchema>>
  query: {
    url: string | ((formData: z.infer<ValidationSchema>) => string)
    enabled?: boolean | ((formData: z.infer<ValidationSchema>) => boolean)
  }
  options?: {
    labelKey?: string
    valueKey?: string
  }
}

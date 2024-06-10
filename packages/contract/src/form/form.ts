import { z } from 'zod'
import { FieldConfig } from './field'
import { BaseValidationSchema } from './schema'

export function createFormConfig<ValidationSchema extends BaseValidationSchema, SubformKey extends string>(
  validationSchema: ValidationSchema,
  formConfig: FormRenderConfig<ValidationSchema, SubformKey>,
  defaultValues?: Partial<z.infer<ValidationSchema>>,
): FormConfig<ValidationSchema, SubformKey> {
  return {
    validationSchema,
    formConfig,
    defaultValues,
  }
}

export type FormConfig<ValidationSchema extends BaseValidationSchema, SubformKey extends string> = {
  validationSchema: ValidationSchema
  formConfig: FormRenderConfig<ValidationSchema, SubformKey>
  defaultValues?: Partial<z.infer<ValidationSchema>>
}

type FormRenderConfig<ValidationSchema extends BaseValidationSchema, SubformKey extends string> = {
  subforms: SubformConfig<ValidationSchema, SubformKey>[]
  steps?: FormStep<ValidationSchema, SubformKey>[]
}

export type SubformConfig<ValidationSchema extends BaseValidationSchema, SubformKey extends string> = {
  id: SubformKey
  name: {
    en: string
    [lang: string]: string
  }
  description?: {
    en: string
    [lang: string]: string
  }
  hidden?: boolean | ((formData: z.infer<ValidationSchema>) => boolean)
  fields: FieldConfig<ValidationSchema>[]
}

export type FormRef<ValidationSchema extends BaseValidationSchema> = {
  getData: () => z.infer<ValidationSchema>
  resetFields: (fieldNames: (keyof z.infer<ValidationSchema>)[]) => void
  setField: (fieldName: keyof z.infer<ValidationSchema>, value: any) => void
  setFields: (fields: Record<keyof z.infer<ValidationSchema>, any>) => void
  setError: (fieldName: keyof z.infer<ValidationSchema>, error: { message: string }) => void
}

type FormStep<ValidationSchema extends BaseValidationSchema, SubformKey> = {
  id: string
  name: {
    en: string
    [lang: string]: string
  }
  description?: {
    en: string
    [lang: string]: string
  }
  hidden?: boolean | ((formData: z.infer<ValidationSchema>) => boolean)
  subforms: SubformKey[]
}

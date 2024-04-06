import { z } from 'zod'
import { CommonFormConfig } from '../types/service'

export function getValidationSchemaFromConfig(config: CommonFormConfig) {
  const allFields = config.subforms.flatMap((subform) => subform.fields)

  let validationSchema = z.object({})

  for (const field of allFields) {
    let schema: z.ZodType = z.any()

    switch (field.type) {
      case 'text':
      case 'textarea':
      case 'radio':
      case 'select': {
        schema = z.string({ required_error: `${field.name} is required!` })
        break
      }

      case 'number': {
        schema = z.number({ required_error: `${field} is required!` })
        break
      }

      case 'checkbox': {
        schema = z.literal(true, {
          required_error: 'Please select the checkbox',
          invalid_type_error: 'Please select the checkbox!',
        })
        break
      }

      case 'date': {
        schema = z.date({ required_error: `${field.name} is required!` })
        break
      }

      case 'email': {
        schema = z.string({ required_error: `${field.name} is required!` }).email('Please enter a valid email address!')
        break
      }

      default: {
        schema = z.any()
      }
    }

    if (!field.required) {
      schema = schema.optional()
    }

    validationSchema = validationSchema.extend({ [field.id]: schema })
  }

  return validationSchema
}

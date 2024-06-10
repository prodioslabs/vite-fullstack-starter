import { match } from 'ts-pattern'
import { FieldConfig } from './field'
import { BaseValidationSchema } from './schema'

export function generateDummyData<ValidationSchema extends BaseValidationSchema>(field: FieldConfig<ValidationSchema>) {
  return match(field)
    .with({ type: 'string' }, () => '')
    .with({ type: 'number' }, () => 0)
    .with({ type: 'object' }, () => {
      return {}
    })
    .otherwise(() => undefined)
}

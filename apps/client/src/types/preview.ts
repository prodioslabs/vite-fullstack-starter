import { Field } from './field'

export type SubformPreviewConfig = {
  type: 'subform'
  id: string
  name: string
  description?: string
  fields: Record<string, Partial<Field> & Pick<Field, 'id' | 'name'>>
}

export type ApplicationPreviewConfig = {
  service: string
  subforms: Array<SubformPreviewConfig>
}

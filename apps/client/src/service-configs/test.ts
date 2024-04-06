import { z } from 'zod'
import { CommonFormConfig } from '../types/service'

export const testServiceConfig: CommonFormConfig = {
  id: 'application',
  type: 'common-form',
  name: 'Application for Registration of Marriage',
  validationSchema: z.object({
    field1: z.string().min(3),
    field2: z.string().min(2),
  }),
  subforms: [
    {
      id: 'subform-1',
      name: 'Subform 1',
      fields: [
        {
          id: 'field1',
          name: 'Field 1',
          type: 'text',
          required: true,
        },
        {
          id: 'field2',
          name: 'Field 2',
          type: 'text',
          required: true,
        },
        {
          id: 'field3',
          name: 'Field 3',
          type: 'text',
          required: true,
        },
        {
          id: 'field4',
          name: 'Field 4',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      id: 'subform-2',
      name: 'Subform 2',
      fields: [
        {
          id: 'field12',
          name: 'Field 12',
          type: 'text',
          required: true,
        },
        {
          id: 'field22',
          name: 'Field 22',
          type: 'text',
          required: true,
        },
        {
          id: 'field32',
          name: 'Field 32',
          type: 'text',
          required: true,
        },
        {
          id: 'field42',
          name: 'Field 42',
          type: 'text',
          required: true,
        },
      ],
    },
  ],
}

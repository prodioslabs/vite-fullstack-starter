import { z } from 'zod'
import { createFormConfig } from '../form'

export const applicationFortesting = createFormConfig(z.object({ field1: z.string() }), {
  subforms: [
    {
      id: 'testApplication',
      name: { en: 'Test Application' },
      fields: [
        {
          id: 'field1',
          name: { en: 'Field One' },
          type: 'string',
        },
      ],
    },
  ],
})

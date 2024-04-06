import { z } from 'zod'
import { StepperFormConfig } from '../types/service'

export const stepperFormConfig: StepperFormConfig = {
  id: 'stepper1',
  name: 'Application for Registration of Marriage',
  type: 'stepper-form',
  steps: [
    {
      id: 'step-1',
      name: 'step1',
      validationSchema: z.object({
        field1: z.string().min(3),
        field2: z.string(),
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
      ],
    },
    {
      id: 'step-2',
      name: 'step2',
      validationSchema: z.object({
        field12: z.string(),
        field22: z.string(),
      }),
      subforms: [
        {
          id: 'subform-12',
          name: 'Subform 12',
          fields: [
            {
              id: 'field12',
              name: 'Field 12',
              type: 'text',
              required: true,
            },
            {
              id: 'field22',
              name: 'Field 2',
              type: 'text',
              required: true,
            },
            {
              id: 'field32',
              name: 'Field 3',
              type: 'text',
              required: true,
            },
            {
              id: 'field42',
              name: 'Field 4',
              type: 'text',
              required: true,
            },
          ],
        },
      ],
    },

    {
      id: 'step-3',
      name: 'step3',
      validationSchema: z.object({
        field13: z.string(),
        field23: z.string(),
      }),
      subforms: [
        {
          id: 'subform-13',
          name: 'Subform 13',
          fields: [
            {
              id: 'field13',
              name: 'Field 13',
              type: 'text',
              required: true,
            },
            {
              id: 'field23',
              name: 'Field 23',
              type: 'text',
              required: true,
            },
          ],
        },
      ],
    },
  ],
}

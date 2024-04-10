import { Meta, StoryObj } from '@storybook/react'
import { z } from 'zod'
import { StepperFormBuilder } from '../components/stepper-form-builder/stepper-form-builder'

export default {
  component: StepperFormBuilder,
} satisfies Meta<typeof StepperFormBuilder>

type Story = StoryObj<typeof StepperFormBuilder>

export const StepperForm: Story = {
  decorators: (Story) => (
    <div className="mx-auto">
      <Story />
    </div>
  ),
  args: {
    config: {
      steps: {
        profile: {
          name: 'Profile',
          description: 'This information will be displayed publicly so be careful what you share.',
          form: {
            subforms: [
              {
                id: 'profile',
                name: 'Profile',
                description: 'This information will be displayed publicly so be careful what you share.',
                fields: [
                  {
                    id: 'firstName',
                    name: 'First Name',
                    type: 'text',
                    placeholder: 'First Name',
                    className: 'col-span-6',
                  },
                  {
                    id: 'lastName',
                    name: 'Last Name',
                    type: 'text',
                    placeholder: 'Last Name',
                    className: 'col-span-6',
                  },
                  {
                    id: 'email',
                    name: 'Email Address',
                    type: 'text',
                    className: 'col-span-9',
                  },
                ],
              },
              {
                id: 'address',
                name: 'Address',
                description: 'This information will be used to send you physical mail.',
                fields: [
                  {
                    id: 'street',
                    name: 'Street Address',
                    type: 'text',
                    placeholder: 'Street Address',
                    className: 'col-span-6',
                  },
                  {
                    id: 'city',
                    name: 'City',
                    type: 'text',
                    placeholder: 'City',
                    className: 'col-span-6',
                  },
                  {
                    id: 'state',
                    name: 'State',
                    type: 'text',
                    placeholder: 'State',
                    className: 'col-span-3',
                  },
                  {
                    id: 'zip',
                    name: 'Zip Code',
                    type: 'text',
                    placeholder: 'Zip Code',
                    className: 'col-span-3',
                  },
                ],
              },
            ],
            validationSchema: z.object({
              profile: z.object({
                firstName: z.string().min(2).max(50),
                lastName: z.string().min(2).max(50),
                email: z.string().email(),
              }),
              address: z.object({
                street: z.string().min(2).max(50),
                city: z.string().min(2).max(50),
                state: z.string().min(2).max(50),
                zip: z.string().min(2).max(50),
              }),
            }),
          },
        },
        account: {
          name: 'Account',
          description: 'This information will be used to log in to your account.',
          form: {
            subforms: [
              {
                id: 'account',
                name: 'Account',
                description: 'This information will be used to log in to your account.',
                fields: [
                  {
                    id: 'username',
                    name: 'Username',
                    type: 'text',
                    placeholder: 'Username',
                    className: 'col-span-6',
                  },
                  {
                    id: 'password',
                    name: 'Password',
                    type: 'text',
                    placeholder: 'Password',
                    className: 'col-span-6',
                  },
                ],
              },
            ],
            validationSchema: z.object({
              account: z.object({
                username: z.string().min(2).max(50),
                password: z.string().min(8),
              }),
            }),
          },
        },
      },
      stepOrder: ['profile', 'account'],
    },
    onSubmit: (values) => {
      console.log('Submitting form')
      console.log(values)
    },
  },
}

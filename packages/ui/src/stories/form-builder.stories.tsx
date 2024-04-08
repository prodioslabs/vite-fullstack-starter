import { Meta, StoryObj } from '@storybook/react'
import { z } from 'zod'
import { FormBuilder } from '../components/form-builder'

export default {
  component: FormBuilder,
} satisfies Meta<typeof FormBuilder>

type Story = StoryObj<typeof FormBuilder>

export const SimpleForm: Story = {
  decorators: (Story) => (
    <div className="max-w-screen-lg mx-auto">
      <Story />
    </div>
  ),
  args: {
    config: {
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
      ],
      validationSchema: z.object({
        profile: z.object({
          firstName: z.string().min(2).max(50),
          lastName: z.string().min(2).max(50),
          email: z.string().email(),
        }),
      }),
    },
    onSubmit: (values) => {
      // eslint-disable-next-line no-console
      console.log(values)
    },
  },
}

export const ProfileForm: Story = {
  decorators: (Story) => (
    <div className="max-w-screen-lg mx-auto">
      <Story />
    </div>
  ),
  args: {
    config: {
      subforms: [
        {
          id: 'profile',
          name: 'Profile',
          description: 'This information will be displayed publicly so be careful what you share.',
          fields: [
            {
              id: 'website',
              name: 'Website',
              type: 'text',
              placeholder: 'Website',
              className: 'col-span-9',
            },
            {
              id: 'about',
              name: 'About',
              type: 'textarea',
            },
          ],
        },
        {
          id: 'personalInformation',
          name: 'Personal Information',
          description: 'Use a permanent address where you can receive mail.',
          fields: [
            {
              id: 'firstName',
              name: 'First Name',
              type: 'text',
              className: 'col-span-6',
            },
            {
              id: 'lastName',
              name: 'Last Name',
              type: 'text',
              className: 'col-span-6',
            },
            {
              id: 'email',
              name: 'Email Address',
              type: 'text',
              className: 'col-span-9',
            },
            {
              id: 'country',
              name: 'Country',
              type: 'select',
              options: [
                {
                  name: 'India',
                  value: 'india',
                },
                {
                  name: 'USA',
                  value: 'usa',
                },
              ],
              className: 'col-span-6',
            },
            {
              id: 'street',
              name: 'Street Address',
              type: 'text',
            },
            {
              id: 'city',
              name: 'City',
              type: 'text',
              className: 'col-span-4',
            },
            {
              id: 'state',
              name: 'State / Province',
              type: 'text',
              className: 'col-span-4',
            },
            {
              id: 'zipcode',
              name: 'ZIP / Postal Code',
              type: 'text',
              className: 'col-span-4',
            },
          ],
        },
        {
          id: 'notifications',
          name: 'Notifications',
          description:
            "We'll always let you know about important changes, but you pick what else you want to hear about.",
          fields: [
            {
              id: 'emailNotifications',
              name: 'By Email',
              type: 'multi-checkbox',
              options: [
                {
                  name: 'Comments',
                  value: 'comments',
                  description: 'Get notified when someones posts a comment on a posting.',
                },
                {
                  name: 'Candidates',
                  value: 'candidates',
                  description: 'Get notified when a candidate applies for a job.',
                },
                {
                  name: 'Offers',
                  value: 'offers',
                  description: 'Get notified when a candidate accepts or rejects an offer.',
                },
              ],
            },
            {
              id: 'pushNotifications',
              name: 'Push Notifications',
              description: 'These are delivered via SMS to your mobile phone.',
              type: 'radio',
              options: [
                {
                  name: 'Everything',
                  value: 'everything',
                },
                {
                  name: 'Same as email',
                  value: 'sameAsEmail',
                },
                {
                  name: 'No push notifications',
                  value: 'none',
                },
              ],
              layout: 'vertical',
            },
          ],
        },
      ],
      validationSchema: z.object({
        profile: z.object({
          website: z.string().url(),
          about: z.string(),
        }),
        personalInformation: z.object({
          firstName: z.string().min(2).max(50),
          lastName: z.string().min(2).max(50),
          country: z.string(),
          street: z.string(),
          email: z.string().email(),
          city: z.string().min(2).max(50),
          state: z.string(),
          zipcode: z.string().min(2).max(10),
        }),
        notifications: z.object({
          emailNotifications: z.array(z.string()),
          pushNotifications: z.string().optional(),
        }),
      }),
    },
  },
}

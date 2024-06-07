import { createFormConfig, file, option } from '@repo/contract'
import axios from 'axios'
import { z } from 'zod'

export const defaultFormConfig = createFormConfig(
  z
    .object({
      email: z.string().email(),
      name: z.string().min(8),
      password: z.string().min(8),
    })
    .refine((data) => data.email !== data.password, {
      message: 'Email and password cannot be the same',
      path: ['email'],
    }),
  {
    subforms: [
      {
        id: 'account-info',
        name: {
          en: 'Account Info',
        },
        description: {
          en: 'Enter your personal information. This will be used to create your account.',
        },
        fields: [
          {
            id: 'name',
            name: {
              en: 'Name',
            },
            type: 'string',
            colSpan: 9,
          },
          {
            id: 'email',
            name: {
              en: 'Email',
            },
            type: 'string',
            colSpan: 6,
          },
          {
            id: 'password',
            name: {
              en: 'Password',
            },
            type: 'string',
            inputType: 'password',
            colSpan: 6,
          },
        ],
      },
    ],
  },
)

export const multiSubformConfig = createFormConfig(
  z.object({
    email: z.string().email(),
    name: z.string().min(8),
    password: z.string().min(8),
    website: z.string().optional(),
    about: z.string().optional(),
  }),
  {
    subforms: [
      {
        id: 'account-info',
        name: {
          en: 'Account Info',
        },
        description: {
          en: 'Enter your personal information. This will be used to create your account.',
        },
        fields: [
          {
            id: 'name',
            name: {
              en: 'Name',
            },
            type: 'string',
            colSpan: 9,
          },
          {
            id: 'email',
            name: {
              en: 'Email',
            },
            type: 'string',
            colSpan: 6,
          },
          {
            id: 'password',
            name: {
              en: 'Password',
            },
            type: 'string',
            inputType: 'password',
            colSpan: 6,
          },
        ],
      },
      {
        id: 'profile-info',
        name: {
          en: 'Profile',
        },
        description: {
          en: 'This information will be displayed publicly so be careful what you share.',
        },
        fields: [
          {
            id: 'website',
            name: {
              en: 'Website',
            },
            type: 'string',
            colSpan: 9,
          },
          {
            id: 'about',
            name: {
              en: 'About',
            },
            type: 'string',
            inputType: 'textarea',
          },
        ],
      },
    ],
  },
)

export const stepsFormConfig = createFormConfig(
  z
    .object({
      email: z.string().email(),
      name: z.string().min(8),
      profileImage: file.optional(),
      password: z.string().min(8),
      website: z.string().optional(),
      about: z.string().optional(),
      notifications: option.array(),
      pushNotifications: option.optional().nullable(),
    })
    .refine(({ email, password }) => email !== password, {
      message: 'Email and password cannot be the same',
      path: ['email'],
    }),
  {
    subforms: [
      {
        id: 'account-info',
        name: {
          en: 'Account Info',
        },
        description: {
          en: 'Enter your personal information. This will be used to create your account.',
        },
        fields: [
          {
            id: 'name',
            name: {
              en: 'Name',
            },
            tooltip: {
              en: 'First child name',
            },
            type: 'string',
            colSpan: 9,
          },
          {
            id: 'email',
            name: {
              en: 'Email',
            },
            type: 'string',
            colSpan: 6,
          },
          {
            id: 'password',
            name: {
              en: 'Password',
            },
            type: 'string',
            inputType: 'password',
            colSpan: 6,
          },
        ],
      },
      {
        id: 'profile-info',
        name: {
          en: 'Profile',
        },
        description: {
          en: 'This information will be displayed publicly so be careful what you share.',
        },
        fields: [
          {
            id: 'website',
            colSpan: 9,
            name: {
              en: 'Website',
            },
            type: 'string',
            onChange: (formRef) => {
              formRef.setField('about', formRef.getData().website)
            },
          },
          {
            id: 'about',
            name: {
              en: 'About',
            },
            type: 'string',
            inputType: 'textarea',
          },
          {
            id: 'profileImage',
            name: {
              en: 'Profile Picture',
            },
            type: 'file',
          },
        ],
      },
      {
        id: 'notifications',
        name: {
          en: 'Notifications',
        },
        description: {
          en: "We'll always let you know about important changes, but you pick what else you want to hear about.",
        },
        fields: [
          {
            id: 'notifications',
            name: {
              en: 'By Email',
            },
            type: 'multi-checkbox',
            options: [
              {
                value: 'comments',
                label: {
                  en: 'Comments',
                },
                description: {
                  en: 'Get notified when someones posts a comment on a posting.',
                },
              },
              {
                value: 'candidates',
                label: {
                  en: 'Candidates',
                },
                description: {
                  en: 'Get notified when a candidate applies for a job',
                },
              },
              {
                value: 'offers',
                label: {
                  en: 'Offers',
                },
                description: {
                  en: 'Get notified when a candidate accepts or rejects an offer.',
                },
              },
            ],
          },
          {
            id: 'pushNotifications',
            name: {
              en: 'Push Notifications',
            },
            description: {
              en: 'These are delivered via SMS to your mobile phone.',
            },
            type: 'radio',
            options: [
              {
                value: 'everything',
                label: {
                  en: 'Everything',
                },
              },
              {
                value: 'email',
                label: {
                  en: 'Email',
                },
              },
              {
                value: 'nothing',
                label: {
                  en: 'No push notifications',
                },
              },
            ],
          },
        ],
      },
    ],
    steps: [
      {
        id: 'account-info',
        name: {
          en: 'Account Information',
        },
        description: {
          en: 'Enter your personal information. This will be used to create your account.',
        },
        subforms: ['account-info', 'profile-info'],
      },
      {
        id: 'notifications',
        name: {
          en: 'Notifications',
        },
        description: {
          en: "We'll always let you know about important changes, but you pick what else you want to hear about.",
        },
        subforms: ['notifications'],
      },
    ],
  },
)

export const multiInputStepFormConfig = createFormConfig(
  z.object({
    teams: z.string().min(8).array(),
    images: file.array(),
  }),
  {
    subforms: [
      {
        id: 'team',
        name: {
          en: 'Team',
        },
        description: {
          en: 'Enter the teams you are a part of.',
        },
        fields: [
          {
            id: 'teams',
            name: {
              en: 'Teams',
            },
            type: 'string',
            multiple: true,
            colSpan: 9,
          },
          {
            id: 'images',
            name: {
              en: 'Images',
            },
            description: {
              en: 'Upload images of your team.',
            },
            type: 'file',
            multiple: true,
          },
        ],
      },
    ],
  },
)

export const objectInputFormConfig = createFormConfig(
  z.object({
    address: z.object({
      streetInfo: z.object({
        line1: z.string(),
        line2: z.string().optional(),
      }),
      city: z.string().min(8),
      state: z.string(),
      zip: z.string().min(6),
    }),
  }),
  {
    subforms: [
      {
        id: 'profile',
        name: {
          en: 'Profile',
        },
        description: {
          en: 'Enter your personal information.',
        },
        fields: [
          {
            id: 'address',
            name: {
              en: 'Address',
            },
            type: 'object',
            fields: [
              {
                id: 'streetInfo',
                name: {
                  en: 'Street',
                },
                type: 'object',
                fields: [
                  {
                    id: 'line1',
                    name: {
                      en: 'Line 1',
                    },
                    type: 'string',
                  },
                  {
                    id: 'line2',
                    name: {
                      en: 'Line 2',
                    },
                    type: 'string',
                  },
                ],
              },
              {
                id: 'city',
                name: {
                  en: 'City',
                },
                type: 'string',
                colSpan: 6,
              },
              {
                id: 'state',
                name: {
                  en: 'State',
                },
                type: 'string',
                colSpan: 6,
              },
              {
                id: 'zip',
                name: {
                  en: 'Zip',
                },
                type: 'string',
                colSpan: 6,
              },
            ],
          },
        ],
      },
    ],
  },
)

export const multiObjectInputForm = createFormConfig(
  z.object({
    address: z
      .array(
        z.object({
          street: z.object({
            line1: z.string(),
            line2: z.string().optional(),
          }),
          city: z.string().min(8),
          state: z.string(),
          zip: z.string().min(6),
        }),
      )
      .min(2),
  }),
  {
    subforms: [
      {
        id: 'profile',
        name: {
          en: 'Profile',
        },
        description: {
          en: 'Enter your personal information.',
        },
        fields: [
          {
            id: 'address',
            multiple: true,
            name: {
              en: 'Address',
            },
            type: 'object',
            fields: [
              {
                id: 'street',
                name: {
                  en: 'Street',
                },
                type: 'object',
                fields: [
                  {
                    id: 'line1',
                    name: {
                      en: 'Line 1',
                    },
                    type: 'string',
                  },
                  {
                    id: 'line2',
                    name: {
                      en: 'Line 1',
                    },
                    type: 'string',
                  },
                ],
              },
              {
                id: 'city',
                name: {
                  en: 'City',
                },
                type: 'string',
                colSpan: 6,
              },
              {
                id: 'state',
                name: {
                  en: 'State',
                },
                type: 'string',
                colSpan: 6,
              },
              {
                id: 'zip',
                name: {
                  en: 'Zip',
                },
                type: 'string',
                colSpan: 6,
              },
            ],
          },
        ],
      },
    ],
  },
)

export const asyncSelectInputForm = createFormConfig(
  z.object({
    post: option,
    comment: option,
  }),
  {
    subforms: [
      {
        id: 'post-and-comments',
        name: {
          en: 'Post and commands',
        },
        description: {
          en: 'Assign comments to a post',
        },
        fields: [
          {
            id: 'post',
            name: {
              en: 'Select post',
            },
            type: 'async-select',
            query: {
              url: 'https://jsonplaceholder.typicode.com/posts',
            },
            options: {
              labelKey: 'title',
              valueKey: 'id',
            },
          },
          {
            id: 'comment',
            name: {
              en: 'Comment related to the post',
            },
            type: 'async-select',
            dependencies: ['post'],
            query: {
              url: (formData) => `https://jsonplaceholder.typicode.com/comments?postId=${formData.post?.value}`,
              enabled: (formData) => !!formData.post?.value,
            },
            allowClear: true,
            options: {
              labelKey: 'name',
              valueKey: 'id',
            },
          },
        ],
      },
    ],
  },
)

export const asyncComboBoxFormConfig = createFormConfig(
  z.object({
    post: option,
    comment: option,
  }),
  {
    subforms: [
      {
        id: 'post-and-comments',
        name: {
          en: 'Post and comments',
        },
        description: {
          en: 'Assign comments to a post',
        },
        fields: [
          {
            id: 'post',
            name: {
              en: 'Select post',
            },
            type: 'async-combobox',
            query: {
              url: 'https://jsonplaceholder.typicode.com/posts',
            },
            options: {
              labelKey: 'title',
              valueKey: 'id',
            },
          },
          {
            id: 'comment',
            name: {
              en: 'Comment related to the post',
            },
            type: 'async-combobox',
            dependencies: ['post'],
            query: {
              url: (formData) => `https://jsonplaceholder.typicode.com/comments?postId=${formData.post?.value}`,
              enabled: (formData) => !!formData.post?.value,
            },
            allowClear: true,
            options: {
              labelKey: 'name',
              valueKey: 'id',
            },
          },
        ],
      },
    ],
  },
)

export const activityLogConfig = createFormConfig(
  z
    .object({
      activity: option,
      payment: option.optional(),
      amount: z.number().optional(),
      reason: z.string().optional(),
      didClientJoinSession: z.boolean().optional(),
      timeSpent: z.number().optional(),
    })
    .superRefine((val, ctx) => {
      if (val.activity.value === 'mark-transaction') {
        if (!val.payment) {
          ctx.addIssue({
            message: 'Payment is required for this activity',
            path: ['payment'],
            code: z.ZodIssueCode.custom,
          })
          return z.NEVER
        }
      }
    }),
  {
    subforms: [
      {
        id: 'activity',
        name: {
          en: 'Activity',
        },
        fields: [
          {
            id: 'activity',
            name: {
              en: 'Activity',
            },
            type: 'select',
            options: [
              {
                value: 'mark-transaction',
                label: {
                  en: 'Mark Transaction',
                },
              },
              {
                value: 'mark-no-show',
                label: {
                  en: 'Mark No Show',
                },
              },
              {
                value: 'mark-call-time',
                label: {
                  en: 'Mark Call Time',
                },
              },
            ],
          },
        ],
      },
      {
        id: 'mark-transaction',
        name: {
          en: 'Mark Transaction',
        },
        fields: [
          {
            id: 'payment',
            name: {
              en: 'Payment',
            },
            type: 'radio',
            options: [
              {
                value: 'money-in',
                label: {
                  en: 'Money In',
                },
              },
              {
                value: 'money-out',
                label: {
                  en: 'Money Out',
                },
              },
            ],
          },
        ],
        hidden: ({ activity }) => {
          return activity?.value !== 'mark-transaction'
        },
      },
    ],
  },
)

export const comboboxFormConfig = createFormConfig(
  z.object({
    post: option,
  }),
  {
    subforms: [
      {
        id: 'post-and-comments',
        name: {
          en: 'Post and commands',
        },
        description: {
          en: 'Assign comments to a post',
        },
        fields: [
          {
            id: 'post',
            name: {
              en: 'Select post',
            },
            type: 'combobox',
            options: [
              {
                value: 'yes',
                label: { en: 'Yes' },
              },
              {
                value: 'no',
                label: { en: 'No' },
              },
            ],
          },
        ],
      },
    ],
  },
)

export const autoFetchConfig = createFormConfig(
  z.object({
    oldRegistrationNumber: z.string(),
    actionButton: z.any(),
  }),
  {
    subforms: [
      {
        id: 'registrationDetails',
        name: {
          en: 'Registration Details',
        },
        fields: [
          {
            id: 'oldRegistrationNumber',
            name: {
              en: 'Old Registration Number',
            },
            type: 'string',
            required: true,
          },
          {
            id: 'actionButton',
            isNameHidden: true,
            name: {
              en: 'Action Button',
            },
            type: 'action',
            label: {
              en: 'Fetch Data',
            },
            queryFn: async (formData) => {
              if (!formData.oldRegistrationNumber) {
                throw new Error('Old Registration Number is required')
              }

              await axios.get('http://localhost:3000/form/marriage', {
                params: {
                  oldRegistrationNumber: formData.oldRegistrationNumber,
                },
                withCredentials: true,
              })
            },
            onQuerySuccess: (formRef, data) => {
              const formData = formRef.getData()

              formRef.setFields({ ...formData, ...data })
            },
            onQueryError: (formRef, error) => {
              formRef.setError('oldRegistrationNumber', { message: error.message })
            },
          },
        ],
      },
    ],
  },
)

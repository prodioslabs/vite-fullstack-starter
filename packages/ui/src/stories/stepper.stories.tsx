import { Meta, StoryObj } from '@storybook/react'
import { Stepper } from '../components/stepper'

export default {
  component: Stepper,
} satisfies Meta<typeof Stepper>

type Story = StoryObj<typeof Stepper>

export const SimpleStepper: Story = {
  args: {
    steps: {
      profile: {
        title: 'Profile',
        description: 'This information will be displayed publicly so be careful what you share.',
      },
      account: {
        title: 'Account',
        description: 'This information will be used to log in to your account.',
      },
      security: {
        title: 'Security',
        description: 'This information will be used to secure your account.',
      },
    },
    stepsOrder: ['profile', 'account', 'security'],
    stepStatus: {
      profile: 'completed',
      account: 'active',
      security: 'not-started',
    },
  },
}

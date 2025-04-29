import { Meta, StoryObj } from '@storybook/react'
import { Button } from '../components/ui/button'

export default {
  component: Button,
} satisfies Meta<typeof Button>
type Story = StoryObj<typeof Button>

export const PrimaryButton: Story = {
  args: {
    children: 'Primary Button',
  },
}

export const OutlineButton: Story = {
  args: {
    children: 'Outline Button',
    variant: 'outline',
  },
}

export const OutlineLoadingButton: Story = {
  args: {
    children: 'Outline Button',
    variant: 'outline',
    loading: true,
  },
}

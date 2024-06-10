import { Meta, StoryObj } from '@storybook/react'
import { FormPreview } from '../components/form-preview'
import {
  defaultFormConfig,
  multiInputStepFormConfig,
  multiObjectInputForm,
  multiSubformConfig,
  objectInputFormConfig,
  stepsFormConfig,
} from './form-builder.config'

export default {
  component: FormPreview,
} satisfies Meta<typeof FormPreview>

type Story = StoryObj<typeof FormPreview>

export const DefaultFormPreview: Story = {
  render: () => (
    <FormPreview
      config={defaultFormConfig}
      formData={{
        email: 'john@doe.com',
        name: 'John Doe',
        password: 'randompassword',
      }}
    />
  ),
}

export const MultiSubformPreview: Story = {
  render: () => (
    <FormPreview
      config={multiSubformConfig}
      formData={{
        email: 'john@doe.com',
        name: 'John Doe',
        password: 'randompassword',
        website: 'https://prodioslabs.com',
        about: 'Crafting Your Digital Dreams into Reality',
      }}
    />
  ),
}

export const StepsFormPreview: Story = {
  render: () => (
    <FormPreview
      config={stepsFormConfig}
      extraFieldProps={{
        fileUploader: {
          getPreviewUrl: () =>
            'https://ucc-api.prodioslabs.com/file/services/application-for-registration-of-marriage.svg',
        },
      }}
      formData={{
        name: 'John Doe',
        email: 'john@doe.com',
        password: 'randompassword',
        website: 'https://prodioslabs.com',
        about: 'Crafting your digital dreams into reality',
        profileImage: {
          mimeType: 'image/png',
        },
        notifications: [
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
        ],
        pushNotifications: {
          value: 'everything',
          label: {
            en: 'Everything',
          },
        },
      }}
    />
  ),
}

export const MultiInputStepFormPreview: Story = {
  render: () => (
    <FormPreview
      config={multiInputStepFormConfig}
      formData={{
        teams: ['Team Number 1', 'Team Number 2'],
        images: [
          {
            url: 'https://ucc-api.prodioslabs.com/file/services/application-for-registration-of-marriage.svg',
            filename: 'application-for-registration-of-marriage.svg',
            mimeType: 'image/svg+xml',
            id: 'image-id',
          },
          {
            url: 'https://ucc-api.prodioslabs.com/file/services/application-for-registration-of-marriage.svg',
            filename: 'application-for-relationship-status-review.svg',
            mimeType: 'image/svg+xml',
            id: 'image-id',
          },
        ],
      }}
      extraFieldProps={{
        fileUploader: {
          getPreviewUrl: (file) => file.url,
        },
      }}
    />
  ),
}

export const ObjectInputFormPreview: Story = {
  render: () => (
    <FormPreview
      config={objectInputFormConfig}
      formData={{
        address: {
          streetInfo: {
            line1: 'Test',
            line2: 'Test',
          },
          city: 'Testing City',
          state: 'Uttarakhand',
          zip: '203432',
        },
      }}
    />
  ),
}

export const MultiObjectFormPreview: Story = {
  render: () => (
    <FormPreview
      config={multiObjectInputForm}
      formData={{
        address: [
          {
            street: {
              line1: 'Test',
              line2: 'Test',
            },
            city: 'Testing City',
            state: 'Uttarakhand',
            zip: '203432',
          },
          {
            street: {
              line1: 'Test',
              line2: 'Test',
            },
            city: 'Testing City',
            state: 'Uttarakhand',
            zip: '203432',
          },
        ],
      }}
    />
  ),
}

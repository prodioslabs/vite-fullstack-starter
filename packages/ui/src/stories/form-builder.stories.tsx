import { Meta, StoryObj } from '@storybook/react'
import { QueryClient, QueryClientProvider, useMutation } from '@tanstack/react-query'
import { FormRef } from '@repo/contract'
import { SaveIcon } from 'lucide-react'
import { useCallback, useEffect } from 'react'
import { Button } from '../components/ui/button'
import { FormBuilder } from '../components/form-builder'
import {
  asyncSelectInputForm,
  activityLogConfig,
  comboboxFormConfig,
  defaultFormConfig,
  multiInputStepFormConfig,
  multiObjectInputForm,
  multiSubformConfig,
  objectInputFormConfig,
  stepsFormConfig,
  asyncComboBoxFormConfig,
} from './form-builder.config'

export default {
  component: FormBuilder,
} satisfies Meta<typeof FormBuilder>
type Story = StoryObj<typeof FormBuilder>

export const DefaultForm: Story = {
  render: () => {
    return (
      <FormBuilder
        className="container"
        config={defaultFormConfig}
        defaultValues={{
          name: '',
          email: '',
          password: '',
        }}
        onSubmit={(data) => {
          // eslint-disable-next-line no-console
          console.log(data)
        }}
      />
    )
  },
}

export const MultiSubform: Story = {
  render: () => {
    return (
      <FormBuilder
        className="container"
        config={multiSubformConfig}
        defaultValues={{
          name: '',
          email: '',
          password: '',
          website: '',
          about: '',
        }}
        onSubmit={(data) => {
          // eslint-disable-next-line no-console
          console.log(data)
        }}
      />
    )
  },
}

const queryClient = new QueryClient()

export const StepsForm: Story = {
  render: () => {
    return (
      <QueryClientProvider client={queryClient}>
        <FormBuilder
          config={stepsFormConfig}
          defaultValues={{
            name: '',
            email: '',
            profileImage: undefined,
            password: '',
            website: '',
            about: '',
            notifications: [],
            pushNotifications: undefined,
          }}
          classNames={{
            stepper: 'sticky top-6',
            footer: 'sticky bottom-0 bg-background',
            subformNameContainer: 'sticky top-14',
          }}
          extraFieldProps={{
            fileUploader: {
              imageUploadHandler: async (file) => {
                const url = URL.createObjectURL(file)
                return {
                  url,
                  filename: file.name,
                  mimeType: file.type,
                  id: 'image-id',
                }
              },
              getPreviewUrl: (file) => file.url,
            },
          }}
          onSubmit={(data) => {
            // eslint-disable-next-line no-console
            console.log(data)
          }}
          extraActions={(formRef) => {
            return (
              <>
                <SaveDraft formRef={formRef} />
                <div className="flex-1" />
              </>
            )
          }}
        />
      </QueryClientProvider>
    )
  },
}

type SaveDraftProps = {
  formRef: FormRef<any>
}

function SaveDraft({ formRef }: SaveDraftProps) {
  const saveDraftMutation = useMutation({
    mutationFn: saveData,
  })

  const saveDraft = useCallback(() => {
    if (!saveDraftMutation.isPending) {
      saveDraftMutation.mutate(formRef.getData())
    }
  }, [formRef, saveDraftMutation])

  useEffect(
    function autoSaveDraft() {
      const interval = setInterval(saveDraft, 3000)
      return () => {
        clearInterval(interval)
      }
    },
    [saveDraft],
  )

  return (
    <Button icon={<SaveIcon />} type="button" variant="ghost" onClick={saveDraft} loading={saveDraftMutation.isPending}>
      Save Draft
    </Button>
  )
}

async function saveData(data: any) {
  // eslint-disable-next-line no-console
  console.log(data)
  return data
}

export const MultiInputStepForm: Story = {
  render: () => {
    return (
      <QueryClientProvider client={queryClient}>
        <FormBuilder
          config={multiInputStepFormConfig}
          defaultValues={{
            teams: [],
            images: [],
          }}
          className="container"
          extraFieldProps={{
            fileUploader: {
              imageUploadHandler: async (file) => {
                const url = URL.createObjectURL(file)
                return {
                  url,
                  filename: file.name,
                  mimeType: file.type,
                  id: 'image-id',
                }
              },
              getPreviewUrl: (file) => file.url,
            },
          }}
          onSubmit={(data) => {
            // eslint-disable-next-line no-console
            console.log(data)
          }}
        />
      </QueryClientProvider>
    )
  },
}

export const ObjectInputForm: Story = {
  render: () => {
    return (
      <FormBuilder
        config={objectInputFormConfig}
        defaultValues={{
          address: {
            streetInfo: {
              line1: '',
              line2: '',
            },
            city: '',
            state: '',
            zip: '',
          },
        }}
        className="container"
        onSubmit={({ address }) => {
          // eslint-disable-next-line no-console
          console.log(address)
        }}
      />
    )
  },
}

export const MultiObjectInputForm: Story = {
  render: () => {
    return (
      <FormBuilder
        config={multiObjectInputForm}
        defaultValues={{
          address: [],
        }}
        className="container"
        onSubmit={({ address }) => {
          // eslint-disable-next-line no-console
          console.log(address)
        }}
      />
    )
  },
}

export const AsyncSelectInputForm: Story = {
  render: () => (
    <QueryClientProvider client={queryClient}>
      <FormBuilder
        config={asyncSelectInputForm}
        defaultValues={{}}
        className="container"
        onSubmit={(data) => {
          // eslint-disable-next-line no-console
          console.log(data)
        }}
      />
    </QueryClientProvider>
  ),
}

export const ActivityLogConfig: Story = {
  render: () => {
    return (
      <FormBuilder
        config={activityLogConfig}
        defaultValues={{
          activity: {
            value: 'mark-transaction',
            label: {
              en: 'Mark Transaction',
            },
          },
          payment: {
            value: 'money-in',
            label: {
              en: 'Money In',
            },
          },
        }}
        className="container"
        onSubmit={(data) => {
          // eslint-disable-next-line no-console
          console.log(data)
        }}
      />
    )
  },
}

export const ComboboxFormConfig: Story = {
  render: () => {
    return (
      <FormBuilder
        config={comboboxFormConfig}
        defaultValues={{}}
        className="container"
        onSubmit={(data) => {
          // eslint-disable-next-line no-console
          console.log(data)
        }}
      />
    )
  },
}

export const AsyncComboboxFormConfig: Story = {
  render: () => (
    <QueryClientProvider client={queryClient}>
      <FormBuilder
        config={asyncComboBoxFormConfig}
        defaultValues={{}}
        className="container"
        onSubmit={(data) => {
          // eslint-disable-next-line no-console
          console.log(data)
        }}
      />
    </QueryClientProvider>
  ),
}

import { Meta, StoryObj } from '@storybook/react'
import { FormConfig, FormRef, serviceConfigs } from '@repo/contract'
import { useCallback, useEffect } from 'react'
import { QueryClient, QueryClientProvider, useMutation } from '@tanstack/react-query'
import { SaveIcon } from 'lucide-react'
import { FormBuilder } from '../components/form-builder'
import { Button } from '../components/ui/button'
import { autoFetchConfig } from './form-builder.config'

export default {
  title: 'Service Forms',
  component: FormBuilder,
} satisfies Meta<typeof FormBuilder>
type Story = StoryObj<typeof FormBuilder>

export const TestingApplication: Story = {
  render: () => {
    return (
      <RenderServiceForm
        config={serviceConfigs['application-for-testing']}
        defaultValues={{
          wifeGender: {
            label: { en: 'Female' },
            value: 'female',
          },
          husbandGender: {
            label: { en: 'Male' },
            value: 'male',
          },
        }}
      />
    )
  },
}

export const AutoFetch: Story = {
  render: () => {
    return <RenderServiceForm config={autoFetchConfig} defaultValues={{}} />
  },
}

const queryClient = new QueryClient()

type RenderServiceFormProps = {
  config: FormConfig<any, any>
  defaultValues: any
}

function RenderServiceForm({ config, defaultValues }: RenderServiceFormProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <FormBuilder
        config={config}
        defaultValues={defaultValues}
        className="max-w-screen-2xl mx-auto"
        classNames={{
          stepper: 'sticky md:top-6 top-0 bg-background',
          footer: 'sticky bottom-0 bg-background',
          subformNameContainer: 'lg:sticky lg:top-14',
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
        extraActions={(formRef) => {
          return (
            <>
              <SaveDraft formRef={formRef} />
              <div className="flex-1" />
            </>
          )
        }}
        onSubmit={(data) => {
          // eslint-disable-next-line no-console
          console.log(data)
        }}
      />
    </QueryClientProvider>
  )
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
      const interval = setInterval(saveDraft, 10000)
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

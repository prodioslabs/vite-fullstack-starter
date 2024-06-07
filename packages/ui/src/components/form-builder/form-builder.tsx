import { useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronLeft, ChevronRight, SaveIcon } from 'lucide-react'
import { z } from 'zod'
import { FormConfig, FormRef, BaseValidationSchema } from '@repo/contract'
import { FileUploader } from '../ui/file-uploader'
import { Stepper, StepStatus } from '../stepper'
import { Form as FormProvider } from '../ui/form'
import Subform from './components/subform'
import { cn, merge } from '../../lib/utils'
import { Button } from '../ui/button'

type FormBuilderProps<ValidationSchema extends BaseValidationSchema, SubformKey extends string> = {
  config: FormConfig<ValidationSchema, SubformKey>
  defaultValues: Partial<z.infer<ValidationSchema>>
  onSubmit?: (data: z.infer<ValidationSchema>) => void
  submitButtonProps?: React.ComponentProps<typeof Button>
  extraActions?: (form: FormRef<ValidationSchema>) => React.ReactNode
  extraFieldProps?: {
    fileUploader?: {
      imageUploadHandler?: React.ComponentProps<typeof FileUploader>['imageUploadHandler']
      getPreviewUrl?: React.ComponentProps<typeof FileUploader>['getPreviewUrl']
    }
  }
  className?: string
  style?: React.CSSProperties
  classNames?: {
    stepper?: string
    form?: string
    footer?: string
    subformNameContainer?: string
  }
}

export function FormBuilder<ValidationSchema extends BaseValidationSchema, SubformKey extends string>({
  config,
  defaultValues,
  onSubmit,
  submitButtonProps,
  extraFieldProps,
  extraActions,
  className,
  style,
  classNames,
}: FormBuilderProps<ValidationSchema, SubformKey>) {
  const form = useForm({
    resolver: zodResolver(config.validationSchema as any),
    defaultValues: merge(config.defaultValues ?? {}, defaultValues ?? {}) as any,
    mode: 'all',
  })

  const formData = useWatch({ control: form.control })

  const formRef = useMemo<FormRef<ValidationSchema>>(() => {
    return {
      getData: () => {
        return form.getValues()
      },
      resetFields: (fieldNames) => {
        fieldNames.forEach((fieldName) => {
          form.resetField(String(fieldName))
        })
      },
      setField: (fieldName, value) => {
        form.setValue(String(fieldName), value)
      },
      setFields: (fields) => {
        Object.entries(fields).forEach(([fieldName, value]) => {
          form.setValue(String(fieldName), value)
        })
      },
      setError: (fieldName, error) => {
        form.setError(String(fieldName), error)
      },
    }
  }, [form])

  const [activeStepIndex, setActiveIndex] = useState(0)

  const stepsToRender = useMemo(
    () =>
      (config.formConfig.steps ?? []).filter((step) => {
        const hidden = typeof step.hidden === 'function' ? step.hidden(formData) : step.hidden
        return !hidden
      }),
    [config, formData],
  )

  const stepsTitleAndDescription = useMemo(() => {
    return stepsToRender.reduce((acc, step) => {
      return {
        ...acc,
        [step.id]: {
          title: step.name.en,
          description: step.description?.en,
        },
      }
    }, {})
  }, [stepsToRender])

  const stepsOrder = useMemo(() => stepsToRender.map((step) => step.id), [stepsToRender])

  const stepStatus = useMemo(
    () =>
      stepsOrder.reduce(
        (acc, stepId, index) => ({
          ...acc,
          [stepId]:
            index < activeStepIndex
              ? ('completed' as const)
              : index === activeStepIndex
                ? ('active' as const)
                : ('not-started' as const),
        }),
        {} as Record<string, StepStatus>,
      ),
    [stepsOrder, activeStepIndex],
  )

  const showStepper = stepsToRender.length > 1

  const subformsToRender = useMemo(() => {
    const allSubforms = config.formConfig.subforms.filter((subform) => {
      if (typeof subform.hidden === 'function') {
        return !subform.hidden(formData)
      }
      return !subform.hidden
    })

    if (showStepper) {
      const currentStepConfig = stepsToRender[activeStepIndex]
      const subformIds = currentStepConfig.subforms
      return allSubforms.filter((subform) => {
        if (!subformIds.includes(subform.id)) {
          return false
        }
        return true
      })
    }

    return allSubforms
  }, [config, formData, stepsToRender, activeStepIndex, showStepper])

  return (
    <FormProvider {...form}>
      <div
        className={cn(
          'relative',
          {
            'grid md:grid-cols-3 lg:grid-cols-4 md:gap-16 items-start': showStepper,
          },
          className,
        )}
        style={style}
      >
        {showStepper ? (
          <Stepper
            steps={stepsTitleAndDescription}
            stepsOrder={stepsOrder as any}
            className={cn('col-span-full md:border md:col-span-1 md:p-6 md:rounded-xl', classNames?.stepper)}
            stepStatus={stepStatus}
            onStepClick={(stepId) => {
              const stepIndex = stepsOrder.indexOf(stepId)
              setActiveIndex(stepIndex)
            }}
          />
        ) : null}

        <form
          onSubmit={form.handleSubmit(
            (data) => {
              onSubmit?.(data)
            },
            (error) => {
              // in case of a stepper form, set the active step
              // where the first error field is present
              if (showStepper) {
                const firstErrorField = Object.keys(error)[0]

                const allSubforms = config.formConfig.subforms

                const stepWithErrorField = stepsToRender.findIndex((step) => {
                  const stepSubformIds = step.subforms
                  const subformFields = stepSubformIds.flatMap((subformId) => {
                    // find out the subform based on the subformId
                    const subform = allSubforms.find((sub) => sub.id === subformId)
                    if (!subform) {
                      return []
                    }
                    // find out all the fields
                    const fields = subform.fields
                    return fields.map((field) => field.id) ?? []
                  })
                  return subformFields.includes(firstErrorField as any)
                })

                setActiveIndex(stepWithErrorField)
              }
            },
          )}
          className={cn('divide-y', {
            'md:col-span-2 col-span-full lg:col-span-3': showStepper,
          })}
        >
          {subformsToRender.map((subform) => {
            return (
              <Subform
                className="py-6"
                key={subform.id as string}
                formRef={formRef}
                config={subform}
                extraFieldProps={extraFieldProps}
                classNames={classNames}
              />
            )
          })}

          <div className={cn('py-6 flex items-center justify-end gap-4', classNames?.footer)}>
            {extraActions?.(formRef)}

            {showStepper ? (
              <Button
                variant="outline"
                icon={<ChevronLeft />}
                type="button"
                key="previous"
                onClick={() => {
                  setActiveIndex((index) => Math.max(index - 1, 0))
                }}
                disabled={activeStepIndex === 0}
              >
                Previous
              </Button>
            ) : null}

            {showStepper && activeStepIndex !== stepsOrder.length - 1 ? (
              <Button
                variant="default"
                icon={<ChevronRight />}
                iconPosition="right"
                type="button"
                key="next"
                onClick={() => {
                  setActiveIndex((index) => Math.min(index + 1, stepsOrder.length))
                }}
              >
                Next
              </Button>
            ) : (
              <Button variant="default" icon={<SaveIcon />} type="submit" {...submitButtonProps} key="submit">
                {submitButtonProps?.children ?? 'Submit'}
              </Button>
            )}
          </div>
        </form>
      </div>
    </FormProvider>
  )
}

import { DefaultValues, FieldValues, Path, UseFormReturn, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { P, match } from 'ts-pattern'
import { Button } from '../ui/button'
import { StepForm, StepperForm } from './types'
import { Stepper } from '../stepper/stepper'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { cn } from '../../lib/utils'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Checkbox } from '../ui/checkbox'
import { RadioGroup, RadioGroupItem } from '../ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Textarea } from '../ui/textarea'

type StepperFormBuilderProps<TFieldValues extends FieldValues> = {
  config: StepperForm<TFieldValues>
  defaultValues: DefaultValues<TFieldValues>
  onSubmit: (value: TFieldValues) => void
  submitButtonProps?: React.ComponentProps<typeof Button>
  extraActions?: (form: UseFormReturn<TFieldValues>) => React.ReactNode
}

export function StepperFormBuilder<TFieldValues extends FieldValues>({
  config,
  defaultValues,
  onSubmit,
  submitButtonProps,
  extraActions,
}: StepperFormBuilderProps<TFieldValues>) {
  const [activeStepIndex, setActiveStepIndex] = useState(0)
  const [formData, setFormData] = useState(defaultValues)

  const currentStepConfig = config.steps[config.stepOrder[activeStepIndex]] as StepForm
  const form = useForm<TFieldValues>({
    defaultValues: formData,
    resolver: zodResolver(currentStepConfig.form.validationSchema),
    mode: 'all',
  })

  const value = useWatch<TFieldValues>({
    control: form.control,
  })

  const handleNext = () => {
    if (activeStepIndex < config.stepOrder.length - 1) {
      setActiveStepIndex((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    if (activeStepIndex > 0) {
      setActiveStepIndex((prev) => prev - 1)
    }
  }

  const handleFinish = () => {
    if (activeStepIndex === config.stepOrder.length - 1) {
      onSubmit(value)
      window.alert('Form submitted')
    }
  }

  const handleSave = () => {
    onSubmit(value)
    window.alert('Form saved')
  }

  const stepsTitleAndDescription = Object.fromEntries(
    config.stepOrder.map((stepId) => {
      const step = config.steps[stepId]
      return [stepId, { title: step.name, description: step.description }]
    }),
  )

  const stepStatus = Object.fromEntries(
    config.stepOrder.map((stepId, index) => [
      stepId,
      index === activeStepIndex ? 'active' : index < activeStepIndex ? 'completed' : 'not-started',
    ]),
  )

  return (
    <div className="flex gap-6">
      <Stepper steps={stepsTitleAndDescription as TFieldValues} stepsOrder={config.stepOrder} stepStatus={stepStatus} />
      <div className="border-l border-border " />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((value) => {
            setFormData(value)
            handleFinish()
          })}
        >
          {currentStepConfig.form.subforms.map((subform) => {
            return (
              <div key={subform.id} className="mb-4">
                <div className="font-medium text-lg leading-relaxed text-foreground">{subform.name}</div>
                <div className="text-sm text-muted-foreground">{subform.description}</div>
                <div className="border-b border-2 my-4" />
                <div className="col-span-8 grid grid-cols-12 gap-6">
                  {subform.fields.map((field) => {
                    return (
                      <FormField
                        key={field.id}
                        name={`${subform.id}.${field.id}` as Path<TFieldValues>}
                        control={form.control}
                        render={({ field: fieldProps }) => {
                          return (
                            <FormItem className={cn(field.className)}>
                              <FormLabel>{field.name}</FormLabel>
                              <FormDescription>{field.description}</FormDescription>
                              <FormControl>
                                {match(field)
                                  .returnType<React.ReactNode>()
                                  .with({ type: 'text' }, (textField) => {
                                    return <Input {...fieldProps} placeholder={textField.placeholder} />
                                  })
                                  .with({ type: 'textarea' }, (textareaField) => {
                                    return <Textarea {...fieldProps} placeholder={textareaField.placeholder} />
                                  })
                                  .with({ type: 'select' }, (selectField) => {
                                    const options =
                                      typeof selectField.options === 'function'
                                        ? selectField.options(value)
                                        : selectField.options
                                    return (
                                      <Select value={fieldProps.value} onValueChange={fieldProps.onChange}>
                                        <SelectTrigger className={cn('col-span-12', field.className)}>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {options.map((option) => {
                                            return (
                                              <SelectItem key={option.value} value={option.value}>
                                                {option.name}
                                              </SelectItem>
                                            )
                                          })}
                                        </SelectContent>
                                      </Select>
                                    )
                                  })
                                  .with({ type: 'radio' }, (radioField) => {
                                    const options =
                                      typeof radioField.options === 'function'
                                        ? radioField.options(value)
                                        : radioField.options
                                    return (
                                      <RadioGroup
                                        value={fieldProps.value}
                                        onValueChange={fieldProps.onChange}
                                        className="space-y-4 py-4"
                                      >
                                        {options.map((option) => {
                                          return (
                                            <div className="flex items-start gap-4" key={option.value}>
                                              <RadioGroupItem
                                                value={option.value}
                                                id={`${subform.id}.${radioField.id}.${option.value}`}
                                              />
                                              <Label
                                                htmlFor={`${subform.id}.${radioField.id}.${option.value}`}
                                                className="mt-0.5 space-y-2"
                                              >
                                                <div>{option.name}</div>
                                                {option.description ? (
                                                  <div className="text-muted-foreground text-sm font-normal">
                                                    {option.description}
                                                  </div>
                                                ) : null}
                                              </Label>
                                            </div>
                                          )
                                        })}
                                      </RadioGroup>
                                    )
                                  })
                                  .with({ type: 'multi-checkbox' }, (multiCheckboxField) => {
                                    const options =
                                      typeof multiCheckboxField.options === 'function'
                                        ? multiCheckboxField.options(value)
                                        : multiCheckboxField.options

                                    const fieldValue = z.array(z.string()).default([]).parse(fieldProps.value)

                                    return (
                                      <div className="space-y-4 py-4">
                                        {options.map((option) => {
                                          const isChecked = fieldValue.includes(option.value)
                                          const onChange = (value: boolean) => {
                                            if (value) {
                                              fieldProps.onChange([...fieldValue, option.value])
                                            } else {
                                              fieldProps.onChange(fieldValue.filter((v) => v !== option.value))
                                            }
                                          }
                                          return (
                                            <div className="flex items-start gap-4" key={option.value}>
                                              <Checkbox
                                                id={`${subform.id}.${multiCheckboxField.id}.${option.value}`}
                                                checked={isChecked}
                                                onCheckedChange={onChange}
                                              />
                                              <Label
                                                htmlFor={`${subform.id}.${multiCheckboxField.id}.${option.value}`}
                                                className="mt-0.5 space-y-2"
                                              >
                                                <div>{option.name}</div>
                                                {option.description ? (
                                                  <div className="text-muted-foreground text-sm font-normal">
                                                    {option.description}
                                                  </div>
                                                ) : null}
                                              </Label>
                                            </div>
                                          )
                                        })}
                                      </div>
                                    )
                                  })
                                  .with(P._, () => null)
                                  .exhaustive()}
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )
                        }}
                      />
                    )
                  })}
                </div>
              </div>
            )
          })}

          <div className="py-6 flex items-center justify-end gap-4">
            {activeStepIndex > 0 ? (
              <Button type="button" onClick={handleBack} variant={'secondary'}>
                Back
              </Button>
            ) : null}
            {activeStepIndex < config.stepOrder.length - 1 ? (
              <Button type="button" onClick={handleNext} disabled={!form.formState.isValid}>
                Next
              </Button>
            ) : null}
            <Button type="button" {...submitButtonProps} variant={'outline'} onClick={handleSave}>
              Save
            </Button>
            {activeStepIndex === config.stepOrder.length - 1 ? (
              <Button type="submit" {...submitButtonProps}>
                Finish
              </Button>
            ) : null}
          </div>
          {extraActions ? extraActions(form) : null}
        </form>
      </Form>
    </div>
  )
}

import { z } from 'zod'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { match, P } from 'ts-pattern'
import { FormConfig } from './types'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { cn } from '../../lib/utils'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select'
import { RadioGroup, RadioGroupItem } from '../ui/radio-group'
import { Label } from '../ui/label'
import { Button } from '../ui/button'
import { Checkbox } from '../ui/checkbox'

type FormBuilderProps = {
  config: FormConfig
  defaultValues: Record<string, unknown>
  onSubmit: (value: Record<string, unknown>) => void
  buttonProps?: React.ComponentProps<typeof Button>
  extraActions?: React.ReactNode
}

export function FormBuilder({ config, defaultValues, onSubmit, buttonProps, extraActions }: FormBuilderProps) {
  const form = useForm({
    resolver: zodResolver(config.validationSchema),
    defaultValues,
  })

  const value = useWatch({ control: form.control })

  return (
    <Form {...form}>
      <form
        className="divide-y"
        onSubmit={form.handleSubmit((value) => {
          window.alert('Hello world')
          onSubmit(value)
        })}
      >
        {config.subforms.map((subform) => {
          return (
            <div className="grid grid-cols-12 gap-16 py-6" key={subform.id}>
              <div className="col-span-4">
                <div className="font-medium leading-relaxed text-foreground">{subform.name}</div>
                <div className="text-sm text-muted-foreground">{subform.description}</div>
              </div>
              <div className="col-span-8 grid grid-cols-12 gap-6">
                {subform.fields.map((field) => {
                  return (
                    <FormField
                      key={field.id}
                      name={`${subform.id}.${field.id}`}
                      control={form.control}
                      render={({ field: fieldProps }) => {
                        return (
                          <FormItem className={cn('col-span-12', field.className)}>
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
          {extraActions}
          <Button variant="default" {...buttonProps}>
            Save
          </Button>
        </div>
      </form>
    </Form>
  )
}

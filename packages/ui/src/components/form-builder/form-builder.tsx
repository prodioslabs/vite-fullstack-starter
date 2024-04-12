import { z } from 'zod'
import { FieldValues, useForm, UseFormReturn, useWatch, Path, DefaultValues, UseFormSetValue } from 'react-hook-form'
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
import { DatePicker } from '../ui/date-picker'

type FormBuilderProps<TFieldValues extends FieldValues> = {
  config: FormConfig<TFieldValues>
  defaultValues: DefaultValues<TFieldValues>
  onSubmit: (value: TFieldValues) => void
  submitButtonProps?: React.ComponentProps<typeof Button>
  extraActions?: (form: UseFormReturn<TFieldValues>) => React.ReactNode
  className?: string
  style?: React.CSSProperties
}

export function FormBuilder<TFieldValues extends FieldValues = FieldValues>({
  config,
  defaultValues,
  onSubmit,
  submitButtonProps,
  extraActions,
  className,
  style,
}: FormBuilderProps<TFieldValues>) {
  const form = useForm<TFieldValues>({
    resolver: zodResolver(config.validationSchema),
    defaultValues,
    mode: 'all',
  })

  const value = useWatch({ control: form.control })

  return (
    <Form {...form}>
      <form
        className={cn('divide-y', className)}
        style={style}
        onSubmit={form.handleSubmit((value) => {
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
                  const isHidden = typeof field.hidden === 'function' ? field.hidden(value) : field.hidden
                  const isDisabled = typeof field.disabled === 'function' ? field.disabled(value) : field.disabled

                  if (isHidden) {
                    return null
                  }

                  return (
                    <FormField
                      key={field.id}
                      name={`${subform.id}.${field.id}` as Path<TFieldValues>}
                      control={form.control}
                      render={({ field: fieldProps }) => {
                        fieldProps.disabled = isDisabled

                        return (
                          <FormItem className={cn('col-span-12', field.className)}>
                            {field.isNameHidden ? null : <FormLabel>{field.name}</FormLabel>}
                            {field.description ? <FormDescription>{field.description}</FormDescription> : null}
                            <FormControl>
                              {match(field)
                                .returnType<React.ReactNode>()
                                .with({ type: 'text' }, (textField) => {
                                  return (
                                    <Input
                                      {...fieldProps}
                                      placeholder={textField.placeholder}
                                      type={textField.inputType}
                                      className={cn({
                                        'bg-muted': fieldProps.disabled,
                                      })}
                                      onChange={(e) => {
                                        fieldProps.onChange(e.target.value)
                                        if (textField.onChange) {
                                          textField.onChange(value, form.setValue as UseFormSetValue<FieldValues>)
                                        }
                                      }}
                                    />
                                  )
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
                                    <Select
                                      value={fieldProps.value}
                                      onValueChange={(val) => {
                                        fieldProps.onChange(val)
                                        if (selectField.onChange) {
                                          selectField.onChange(value, form.setValue as UseFormSetValue<FieldValues>)
                                        }
                                      }}
                                      disabled={fieldProps.disabled}
                                    >
                                      <SelectTrigger
                                        className={cn('col-span-12', field.className, {
                                          'bg-muted': fieldProps.disabled,
                                        })}
                                      >
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
                                .with({ type: 'checkbox' }, (checkboxField) => {
                                  return (
                                    <div className="flex items-start gap-4">
                                      <Checkbox
                                        {...fieldProps}
                                        id={`${subform.id}.${checkboxField.id}`}
                                        checked={fieldProps.value}
                                        onCheckedChange={fieldProps.onChange}
                                      />
                                      <Label htmlFor={`${subform.id}.${checkboxField.id}`}>{checkboxField.label}</Label>
                                    </div>
                                  )
                                })
                                .with({ type: 'date' }, (dateField) => {
                                  return (
                                    <DatePicker
                                      {...fieldProps}
                                      placeholder={dateField.placeholder}
                                      className="w-full"
                                      date={fieldProps.value}
                                      onChange={(date) => {
                                        fieldProps.onChange(date)
                                        if (dateField.onChange) {
                                          dateField.onChange(value, form.setValue as UseFormSetValue<FieldValues>)
                                        }
                                      }}
                                    />
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
          {extraActions?.(form)}
          <Button variant="default" {...submitButtonProps}>
            {submitButtonProps?.children ?? 'Save'}
          </Button>
        </div>
      </form>
    </Form>
  )
}

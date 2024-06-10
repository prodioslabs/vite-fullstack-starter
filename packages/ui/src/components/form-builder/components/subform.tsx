import { useFormContext, useWatch } from 'react-hook-form'
import { match } from 'ts-pattern'
import { useCallback } from 'react'
import { z } from 'zod'
import { Check, ChevronDown, InfoIcon, X } from 'lucide-react'
import { option, FormRef, SubformConfig, FieldConfig, BaseValidationSchema } from '@repo/contract'
import dayjs from 'dayjs'
import { cn } from '../../../lib/utils'
import { FormDescription, FormItem, FormLabel, FormFieldWithoutController, FormControl } from '../../ui/form'
import { Input } from '../../ui/input'
import { Textarea } from '../../ui/textarea'
import { RadioGroup, RadioGroupItem } from '../../ui/radio-group'
import { Label } from '../../ui/label'
import { Checkbox } from '../../ui/checkbox'
import { DatePicker } from '../../ui/date-picker'
import { FileUploader } from '../../ui/file-uploader'
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '../../ui/tooltip'
import InputField from './input-field'
import { AsyncSelect } from '../../ui/async-select'
import { RichTextRenderer } from '../../ui/rich-text-renderer'
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../../ui/command'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select'
import DataQueryAction from './data-query-action'
import {
  MultiSelector,
  MultiSelectorContent,
  MultiSelectorInput,
  MultiSelectorItem,
  MultiSelectorList,
  MultiSelectorTrigger,
} from '../../ui/multi-selector'
import { AsyncCombobox } from '../../ui/async-combobox'

type SubformProps<ValidationSchema extends BaseValidationSchema, SubformKey extends string> = {
  config: SubformConfig<ValidationSchema, SubformKey>
  formRef: FormRef<ValidationSchema>
  extraFieldProps?: {
    fileUploader?: {
      imageUploadHandler?: React.ComponentProps<typeof FileUploader>['imageUploadHandler']
      getPreviewUrl?: React.ComponentProps<typeof FileUploader>['getPreviewUrl']
    }
  }
  className?: string
  style?: React.CSSProperties
  classNames?: {
    subformNameContainer?: string
  }
}

export default function Subform<ValidationSchema extends BaseValidationSchema, SubformKey extends string>({
  config,
  formRef,
  extraFieldProps,
  className,
  style,
  classNames,
}: SubformProps<ValidationSchema, SubformKey>) {
  const form = useFormContext()
  const formData = useWatch({ control: form.control })

  const fieldsToRender = config.fields.filter((field) => {
    const hidden = typeof field.hidden === 'function' ? field.hidden(formData) : field.hidden
    return !hidden
  })

  const renderFields = useCallback(
    (fields: FieldConfig<ValidationSchema>[], rootField?: string) => {
      return (
        <>
          {fields.map((field) => {
            const isHidden = typeof field.hidden === 'function' ? field.hidden(formData) : field.hidden
            const isDisabled = typeof field.disabled === 'function' ? field.disabled(formData) : field.disabled

            if (isHidden) {
              return null
            }

            const fieldName = typeof rootField !== 'undefined' ? `${rootField}.${String(field.id)}` : String(field.id)

            return (
              <FormFieldWithoutController key={fieldName} name={fieldName}>
                <FormItem
                  className="lg:col-[span_var(--field-col-span)_/_span_var(--field-col-span)] col-span-full"
                  style={
                    {
                      '--field-col-span': field.colSpan ?? 12,
                    } as React.CSSProperties
                  }
                >
                  {field.isNameHidden ? null : (
                    <FormLabel className="flex items-center">
                      <span
                        className={cn('flex-1', {
                          'text-lg font-bold -mb-6': field.type === 'heading',
                        })}
                      >
                        {field.name.en}
                        {field.required ? <span className="text-destructive">*</span> : null}
                      </span>
                      {field.tooltip ? (
                        <TooltipProvider>
                          <Tooltip delayDuration={0}>
                            <TooltipTrigger>
                              <InfoIcon className="w-4 h-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>{field.tooltip.en}</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : null}
                    </FormLabel>
                  )}
                  {field.description ? <FormDescription>{field.description.en}</FormDescription> : null}
                  <InputField
                    field={{
                      ...field,
                      id: fieldName,
                    }}
                    control={form.control}
                    /**
                     * resolvedFieldName would be the most accurate field name
                     * in case of multi input field, the resolveFieldName would have the proper index, which
                     * won't be present in the fieldName as the index would be appended by the MultiInputField
                     * component
                     */
                    renderInput={({ field: fieldProps, fieldName: resolvedFieldName }) => {
                      fieldProps.disabled = isDisabled

                      const handleChange = (value: any) => {
                        fieldProps.onChange(value)
                        setTimeout(() => {
                          field.onChange?.(formRef)
                        })
                      }

                      return (
                        <FormControl>
                          {match(field)
                            .returnType<React.ReactNode>()
                            .with({ type: 'string' }, (stringField) => {
                              if (stringField.inputType === 'textarea') {
                                return (
                                  <Textarea
                                    {...fieldProps}
                                    value={fieldProps.value ?? ''}
                                    placeholder={stringField.placeholder}
                                    maxLength={stringField.maxLength}
                                    rows={10}
                                  />
                                )
                              }

                              return (
                                <Input
                                  {...fieldProps}
                                  value={fieldProps.value ?? undefined}
                                  placeholder={stringField.placeholder}
                                  type={stringField.inputType}
                                  className={cn({
                                    'bg-muted': fieldProps.disabled,
                                  })}
                                  onChange={handleChange}
                                  maxLength={stringField.maxLength}
                                />
                              )
                            })
                            .with({ type: 'select' }, (selectField) => {
                              const options =
                                typeof selectField.options === 'function'
                                  ? selectField.options(formData)
                                  : selectField.options

                              const parsedValue = option.safeParse(fieldProps.value)
                              const value = parsedValue.success ? parsedValue.data.value : fieldProps.value

                              return (
                                <Select
                                  value={value}
                                  onValueChange={(valueSelected) => {
                                    const optionSelected = options.find((option) => option.value === valueSelected)
                                    handleChange(optionSelected)
                                  }}
                                  disabled={fieldProps.disabled}
                                >
                                  <SelectTrigger
                                    className={cn('col-span-12', {
                                      'bg-muted': fieldProps.disabled,
                                    })}
                                    allowClear={selectField.allowClear ?? true}
                                    onClear={() => {
                                      fieldProps.onChange(null)
                                    }}
                                  >
                                    <SelectValue placeholder={selectField.placeholder ?? 'Select an option'} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {options.map((option) => {
                                      return (
                                        <SelectItem key={option.value} value={option.value}>
                                          {option.label.en}
                                        </SelectItem>
                                      )
                                    })}
                                  </SelectContent>
                                </Select>
                              )
                            })
                            .with({ type: 'combobox' }, (comboboxField) => {
                              const options =
                                typeof comboboxField.options === 'function'
                                  ? comboboxField.options(formData)
                                  : comboboxField.options

                              const parsedValue = option.safeParse(fieldProps.value)
                              const value = parsedValue.success ? parsedValue.data.value : fieldProps.value

                              return (
                                <Popover>
                                  <div className="flex items-center">
                                    <PopoverTrigger asChild disabled={fieldProps.disabled}>
                                      <div className="w-full border py-1 px-3 rounded-md text-sm text-muted-foreground cursor-pointer">
                                        <div className="truncate w-11/12">
                                          {options.find((option) => option.value === value)?.label.en ??
                                            comboboxField.placeholder ??
                                            'Select an option'}
                                        </div>
                                      </div>
                                    </PopoverTrigger>
                                    {value ? (
                                      <X
                                        onClick={() => {
                                          fieldProps.onChange(undefined)
                                        }}
                                        className="h-5 w-5 p-1 -ml-6 text-muted-foreground z-10 cursor-pointer"
                                      />
                                    ) : (
                                      <ChevronDown className="h-3 w-3 -ml-6 text-muted-foreground cursor-pointer" />
                                    )}
                                  </div>
                                  <PopoverContent className="w-full p-0" align="start">
                                    <Command aria-disabled="true">
                                      <CommandInput placeholder="Search" />
                                      <CommandEmpty>No option found.</CommandEmpty>
                                      <CommandList>
                                        <CommandGroup>
                                          {options.map((option) => (
                                            <CommandItem
                                              key={option.value}
                                              value={option.value}
                                              onSelect={(currentValue) => {
                                                const optionSelected = options.find(
                                                  (option) => option.value === currentValue,
                                                )
                                                handleChange(optionSelected)
                                              }}
                                            >
                                              <Check
                                                className={cn(
                                                  'mr-2 h-4 w-4 ',
                                                  value === option.value ? 'opacity-100' : 'opacity-0',
                                                )}
                                              />
                                              {option.label.en}
                                            </CommandItem>
                                          ))}
                                        </CommandGroup>
                                      </CommandList>
                                    </Command>
                                  </PopoverContent>
                                </Popover>
                              )
                            })
                            .with({ type: 'radio' }, (radioField) => {
                              const options =
                                typeof radioField.options === 'function'
                                  ? radioField.options(formData)
                                  : radioField.options

                              const parsedValue = option.safeParse(fieldProps.value)
                              const value = parsedValue.success ? parsedValue.data.value : fieldProps.value

                              return (
                                <RadioGroup
                                  value={value}
                                  onValueChange={(valueSelected) => {
                                    const optionSelected = options.find((option) => option.value === valueSelected)
                                    handleChange(optionSelected)
                                  }}
                                  className="space-y-4 py-4"
                                >
                                  {options.map((option) => {
                                    return (
                                      <div className="flex items-start gap-4" key={option.value}>
                                        <RadioGroupItem
                                          value={option.value}
                                          id={`${config.id}.${String(radioField.id)}.${option.value}`}
                                        />
                                        <Label
                                          htmlFor={`${config.id}.${String(radioField.id)}.${option.value}`}
                                          className="mt-0.5 space-y-0.5"
                                        >
                                          <div>{option.label.en}</div>
                                          {option.description ? (
                                            <div className="text-muted-foreground text-sm font-normal">
                                              {option.description.en}
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
                                  ? multiCheckboxField.options(formData)
                                  : multiCheckboxField.options

                              const parsedValue = option.array().default([]).safeParse(fieldProps.value)
                              const fieldValue = parsedValue.success ? parsedValue.data : []

                              return (
                                <div className="space-y-4 py-4">
                                  {options.map((option) => {
                                    const isChecked = !!fieldValue.find((item) => item.value === option.value)

                                    const onChange = (value: boolean) => {
                                      if (value) {
                                        handleChange([...fieldValue, option])
                                      } else {
                                        handleChange(fieldValue.filter((v) => v.value !== option.value))
                                      }
                                    }

                                    return (
                                      <div className="flex items-start gap-4" key={option.value}>
                                        <Checkbox
                                          id={`${config.id}.${String(multiCheckboxField.id)}.${option.value}`}
                                          checked={isChecked}
                                          onCheckedChange={onChange}
                                        />
                                        <Label
                                          htmlFor={`${config.id}.${String(multiCheckboxField.id)}.${option.value}`}
                                          className="mt-0.5 space-y-0.5"
                                        >
                                          <div>{option.label.en}</div>
                                          {option.description ? (
                                            <div className="text-muted-foreground text-sm font-normal">
                                              {option.description.en}
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
                                    id={`${config.id}.${String(checkboxField.id)}`}
                                    checked={fieldProps.value}
                                    onCheckedChange={handleChange}
                                  />
                                  {checkboxField.label ? (
                                    <Label
                                      htmlFor={`${config.id}.${String(checkboxField.id)}`}
                                      className="font-normal text-muted-foreground"
                                    >
                                      {checkboxField.required ? (
                                        <div className="text-destructive text-xs mb-1">Required</div>
                                      ) : null}
                                      <RichTextRenderer content={checkboxField.label.en} />
                                    </Label>
                                  ) : null}
                                </div>
                              )
                            })
                            .with({ type: 'date' }, (dateField) => {
                              const value = z.string().datetime().safeParse(fieldProps.value).success
                                ? dayjs(fieldProps.value).toDate()
                                : undefined

                              return (
                                <div>
                                  <DatePicker
                                    {...fieldProps}
                                    placeholder={dateField.placeholder}
                                    className="w-full"
                                    date={value}
                                    onChange={(dateSelected) => {
                                      handleChange(dateSelected ? dayjs(dateSelected).toISOString() : null)
                                    }}
                                  />
                                </div>
                              )
                            })
                            .with({ type: 'file' }, (fileField) => {
                              return (
                                <>
                                  <FileUploader
                                    onValueChange={(file) => {
                                      handleChange(file)
                                    }}
                                    value={fieldProps.value}
                                    description={fileField.fileDescription}
                                    imageUploadHandler={extraFieldProps?.fileUploader?.imageUploadHandler}
                                    getPreviewUrl={extraFieldProps?.fileUploader?.getPreviewUrl}
                                  />
                                  {fileField.notes?.map((note) => {
                                    if (note.type === 'html') {
                                      return (
                                        <div
                                          key={note.id}
                                          className="text-muted-foreground text-sm"
                                          dangerouslySetInnerHTML={{ __html: note.en }}
                                        />
                                      )
                                    }
                                    return null
                                  })}
                                </>
                              )
                            })
                            .with({ type: 'object' }, (objectField) => {
                              return (
                                <div className="border rounded-md p-4 grid grid-cols-12 gap-4">
                                  {renderFields(objectField.fields, resolvedFieldName)}
                                </div>
                              )
                            })
                            .with({ type: 'async-select' }, (asyncSelectField) => {
                              return (
                                <AsyncSelect
                                  {...asyncSelectField}
                                  className="col-span-12"
                                  onChange={handleChange}
                                  disabled={fieldProps.disabled}
                                />
                              )
                            })
                            .with({ type: 'action' }, (dataQueryActionField) => {
                              return <DataQueryAction field={dataQueryActionField} formRef={formRef} />
                            })
                            .with({ type: 'multi-select' }, (multiSelectField) => {
                              const options =
                                typeof multiSelectField.options === 'function'
                                  ? multiSelectField.options(formData)
                                  : multiSelectField.options
                              return (
                                <MultiSelector value={fieldProps.value} onValueChange={handleChange}>
                                  <MultiSelectorTrigger>
                                    <MultiSelectorInput />
                                  </MultiSelectorTrigger>
                                  <MultiSelectorContent>
                                    <MultiSelectorList>
                                      {options.map((option, i) => (
                                        <MultiSelectorItem key={i} value={option.value}>
                                          {option.label.en}
                                        </MultiSelectorItem>
                                      ))}
                                    </MultiSelectorList>
                                  </MultiSelectorContent>
                                </MultiSelector>
                              )
                            })
                            .with({ type: 'async-combobox' }, (asyncComboboxField) => {
                              const parsedValue = option.safeParse(fieldProps.value)
                              const value = parsedValue.success ? parsedValue.data.value : fieldProps.value

                              return (
                                <AsyncCombobox
                                  {...asyncComboboxField}
                                  onChange={handleChange}
                                  disabled={fieldProps.disabled}
                                  value={value}
                                />
                              )
                            })
                            .otherwise(() => null)}
                        </FormControl>
                      )
                    }}
                  />
                </FormItem>
              </FormFieldWithoutController>
            )
          })}
        </>
      )
    },
    [config.id, extraFieldProps, form.control, formRef, formData],
  )

  return (
    <div className={cn('grid grid-cols-12 lg:gap-16 gap-8 py-6 relative items-start', className)} style={style}>
      <div className={cn('col-span-full lg:col-span-4', classNames?.subformNameContainer)}>
        <div className="font-medium leading-relaxed text-foreground">{config.name.en}</div>
        {config.description ? <div className="text-sm text-muted-foreground">{config.description.en}</div> : null}
      </div>
      <div className="lg:col-span-8 col-span-full grid grid-cols-12 gap-6">{renderFields(fieldsToRender)}</div>
    </div>
  )
}

import React from 'react'
import { useFormContext } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { z } from 'zod'
import { Check, ChevronDown, X } from 'lucide-react'
import { AsyncComboboxField, BaseValidationSchema, Option, option } from '@repo/contract'
import { get, zipObject } from 'lodash'
import { Popover, PopoverTrigger, PopoverContent } from './popover'
import { Command, CommandInput, CommandEmpty, CommandList, CommandGroup, CommandItem } from './command'
import { cn } from '../../lib/utils'

type AsyncComboboxProps<ValidationSchema extends BaseValidationSchema> = Pick<
  AsyncComboboxField<ValidationSchema>,
  'id' | 'allowClear' | 'placeholder' | 'dependencies' | 'query' | 'options'
> & {
  className?: string
  style?: React.CSSProperties
  value?: string
  onChange?: (option?: Option | null) => void
  disabled?: boolean
}

export function AsyncCombobox<ValidationSchema extends BaseValidationSchema>({
  id,
  query,
  dependencies = [],
  value,
  onChange,
  disabled,
  placeholder,
  options,
}: AsyncComboboxProps<ValidationSchema>) {
  const form = useFormContext()
  const formData = form.watch(dependencies.map((d) => String(d)))

  const mappedFormData = zipObject(dependencies, formData)

  const isQueryEnabled = typeof query.enabled === 'function' ? query.enabled(mappedFormData) : !query.enabled

  const optionsQuery = useQuery({
    queryKey: [id, mappedFormData],
    retry: false,
    queryFn: async () => {
      const labelKey = options?.labelKey ?? 'label'
      const valueKey = options?.valueKey ?? 'value'
      const apiUrl = typeof query.url === 'function' ? query.url(mappedFormData) : query.url

      const { data } = await axios.get<any[]>(apiUrl)

      const parsedOptions = z.array(option).safeParse(
        data.map((item) => ({
          label: { en: get(item, labelKey) },
          value: String(get(item, valueKey)),
        })),
      )
      if (!parsedOptions.success) {
        throw new Error('Received invalid response from API.')
      }

      return parsedOptions.data
    },
    enabled: isQueryEnabled,
  })

  const selectDisabled = disabled || !isQueryEnabled || optionsQuery.isFetching

  if (optionsQuery.isError) {
    return <div className="text-destructive">{optionsQuery.error?.message ?? 'Received invalid options from API'}</div>
  }

  const currentOptions = optionsQuery.data ?? []

  return (
    <Popover>
      <div className="flex items-center">
        <PopoverTrigger asChild disabled={selectDisabled}>
          <div className="w-full border py-1 px-3 rounded-md text-sm text-muted-foreground cursor-pointer">
            <div className="truncate w-11/12">
              {currentOptions.find((option) => option.value === value)?.label.en ?? placeholder ?? 'Select an option'}
            </div>
          </div>
        </PopoverTrigger>
        {value ? (
          <X
            onClick={() => {
              onChange?.(null)
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
          <CommandGroup>
            <CommandList>
              {currentOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={(currentValue) => {
                    const optionSelected = currentOptions.find((option) => option.value === currentValue)
                    onChange?.(optionSelected)
                  }}
                >
                  <Check className={cn('mr-2 h-4 w-4', value === option.value ? 'opacity-100' : 'opacity-0')} />
                  {option.label.en}
                </CommandItem>
              ))}
            </CommandList>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

import { AsyncSelectField, BaseValidationSchema, option, Option } from '@repo/contract'
import { useQuery } from '@tanstack/react-query'
import { useFormContext } from 'react-hook-form'
import axios from 'axios'
import { z } from 'zod'
import { get, zipObject } from 'lodash'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'
import { cn } from '../../lib/utils'

type AsyncSelectProps<ValidationSchema extends BaseValidationSchema> = Pick<
  AsyncSelectField<ValidationSchema>,
  'id' | 'allowClear' | 'placeholder' | 'dependencies' | 'query' | 'options'
> & {
  className?: string
  style?: React.CSSProperties
  value?: string
  onChange?: (option?: Option | null) => void
  disabled?: boolean
}

export function AsyncSelect<ValidationSchema extends BaseValidationSchema>({
  className,
  style,
  id,
  query,
  dependencies = [],
  value,
  onChange,
  disabled,
  allowClear,
  placeholder,
  options,
}: AsyncSelectProps<ValidationSchema>) {
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

  const selectDisabled = disabled || !isQueryEnabled || optionsQuery.isPending

  if (optionsQuery.isError) {
    return <div className="text-destructive">{optionsQuery.error?.message ?? 'Received invalid options from API'}</div>
  }

  return (
    <Select
      value={value}
      onValueChange={(valueSelected) => {
        const optionSelected = optionsQuery?.data?.find((option) => option.value === valueSelected)
        onChange?.(optionSelected)
      }}
      disabled={selectDisabled}
    >
      <SelectTrigger
        className={cn(className, { 'bg-muted': disabled })}
        style={style}
        value={value}
        allowClear={allowClear}
        onClear={() => {
          onChange?.(null)
        }}
        loading={optionsQuery.isPending}
      >
        <SelectValue placeholder={placeholder ?? 'Select an option'} />
      </SelectTrigger>

      <SelectContent>
        {optionsQuery?.data?.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label.en}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

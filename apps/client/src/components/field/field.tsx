import { useController, useFormContext } from 'react-hook-form'
import { useMemo } from 'react'
import {
  Checkbox,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui'
import { Field as FieldType } from '../../types/field'

type FieldProps = {
  className?: string
  style?: React.CSSProperties
  field: FieldType
}

export default function Field({ className, style, field }: FieldProps) {
  const { watch, setValue } = useFormContext()
  const { field: controllerField } = useController({ name: field.id })
  const values = watch()

  const isHidden = typeof field.hidden === 'function' ? field.hidden(values) : field.hidden
  const isDisabled = typeof field.disabled === 'function' ? field.disabled(values) : field.disabled

  const fieldContent = useMemo(() => {
    const commonProps = {
      className,
      style,
      hidden: isHidden,
      disabled: isDisabled,
      maxLength: field.maxLength,
      placeholder: field?.placeholder ?? field.name,
    }

    switch (field.type) {
      case 'text':
      case 'email': {
        return (
          <Input
            {...controllerField}
            {...commonProps}
            onChange={(e) => {
              controllerField.onChange(e)
              if (typeof field.onChange === 'function') {
                field.onChange(values, setValue)
              }
            }}
          />
        )
      }

      case 'number': {
        return (
          <Input
            type="number"
            {...controllerField}
            {...commonProps}
            onChange={(e) => {
              if (typeof field.onChange === 'function') {
                field.onChange(values, setValue)
              }

              controllerField.onChange(e.currentTarget.valueAsNumber)
            }}
          />
        )
      }

      case 'checkbox': {
        return (
          <div className="flex gap-2">
            <Checkbox
              id={field.id}
              checked={controllerField.value}
              onCheckedChange={controllerField.onChange}
              disabled={commonProps.disabled}
            />
            <label htmlFor={field.id}>{field.name}</label>
          </div>
        )
      }

      case 'select': {
        const options = typeof field.options === 'function' ? field.options(values) : field.options
        return (
          <Select value={controllerField.value} onValueChange={controllerField.onChange}>
            <SelectTrigger>
              <SelectValue placeholder={commonProps.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.id} value={option.value}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      }

      default: {
        return null
      }
    }
  }, [className, controllerField, field, isDisabled, isHidden, setValue, style, values])

  return (
    <FormItem className={field.className} hidden={isHidden}>
      <FormLabel>
        {field.name}
        {field.required ? (
          <span className="text-red-500">*</span>
        ) : (
          <span className="text-xs font-normal text-muted-foreground">(optional)</span>
        )}
      </FormLabel>
      <FormControl>{fieldContent}</FormControl>
      <FormMessage />
    </FormItem>
  )
}

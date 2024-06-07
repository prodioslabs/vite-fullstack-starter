import React, { forwardRef } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { cn } from '../../../lib/utils'
import { InputFieldProps } from './field.props'

const SingleInputField = forwardRef<React.ElementRef<'div'>, InputFieldProps>(
  ({ field, control, renderInput, className, style }, ref) => {
    const fieldName = String(field.id)

    const { getFieldState, formState } = useFormContext()
    const fieldState = getFieldState(fieldName, formState)
    const errorMessage = fieldState?.error?.message

    return (
      <div className={cn('space-y-1', className)} style={style} ref={ref}>
        <Controller
          name={fieldName}
          control={control}
          render={(args) => {
            return renderInput({ ...args, fieldName })
          }}
        />
        {errorMessage ? <div className="text-xs font-medium text-destructive">{errorMessage}</div> : null}
      </div>
    )
  },
)

export default SingleInputField

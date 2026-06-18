import { forwardRef, useId } from 'react'

import { Input, type InputProps } from '@/components/ui/input'
import { cn } from '@/lib/utils'

type TimePickerProps = Omit<InputProps, 'type'>

const TimePicker = forwardRef<HTMLInputElement, TimePickerProps>(
  ({ className, id, step = 1, ...props }, ref) => {
    const generatedId = useId()

    return (
      <Input
        ref={ref}
        type="time"
        id={id ?? generatedId}
        step={step}
        className={cn(
          'appearance-none bg-background [&_input::-webkit-calendar-picker-indicator]:hidden [&_input::-webkit-calendar-picker-indicator]:appearance-none',
          className,
        )}
        {...props}
      />
    )
  },
)

TimePicker.displayName = 'TimePicker'

export { TimePicker, type TimePickerProps }

import * as React from 'react'
import { format } from 'date-fns'
import { type SelectSingleEventHandler } from 'react-day-picker'
import { CalendarIcon } from 'lucide-react'
import { Button } from './button'
import { Calendar } from './calendar'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import { cn } from '../../lib/utils'

type DatePickerProps = {
  date?: Date
  onChange?: SelectSingleEventHandler
  className?: string
  style?: React.CSSProperties
  placeholder?: string
  disabled?: boolean
}

export function DatePicker({
  date,
  onChange,
  className,
  style,
  placeholder = 'Pick a date',
  disabled,
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn('justify-start text-left font-normal', !date && 'text-muted-foreground', className)}
          style={style}
          icon={<CalendarIcon />}
          disabled={disabled}
        >
          {date ? format(date, 'PPP') : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={date} onSelect={onChange} initialFocus disabled={disabled} />
      </PopoverContent>
    </Popover>
  )
}

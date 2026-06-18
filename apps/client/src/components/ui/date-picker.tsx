'use client'

import dayjs from 'dayjs'
import { CalendarIcon } from 'lucide-react'
import { forwardRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

type DatePickerProps = {
  value?: Date | null
  onChange: (value: Date | undefined) => void
  disabled?: boolean
  placeholder?: string
  className?: string
}

const DATE_PRESETS = [
  { label: 'Today', daysFromToday: 0 },
  { label: 'Tomorrow', daysFromToday: 1 },
  { label: 'In a week', daysFromToday: 7 },
] as const

const DatePicker = forwardRef<HTMLButtonElement, DatePickerProps>(
  (
    { value, onChange, disabled, placeholder = 'Pick a date', className },
    ref,
  ) => {
    const [open, setOpen] = useState(false)
    const [month, setMonth] = useState<Date | undefined>(undefined)

    const resolvedMonth =
      month ??
      dayjs(value ?? new Date())
        .startOf('month')
        .toDate()

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild disabled={disabled}>
          <Button
            ref={ref}
            type="button"
            variant="outline"
            className={cn(
              'w-full justify-start font-normal',
              !value && 'text-muted-foreground',
              className,
            )}
            disabled={disabled}
          >
            <CalendarIcon className="size-4" />
            {value ? dayjs(value).format('MMM D, YYYY') : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-fit max-w-[300px] gap-0" align="start">
          <Calendar
            mode="single"
            selected={value ?? undefined}
            onSelect={(nextDate) => {
              if (!nextDate) {
                onChange(undefined)
                setOpen(false)
                return
              }

              const normalized = new Date(
                nextDate.getFullYear(),
                nextDate.getMonth(),
                nextDate.getDate(),
              )
              onChange(normalized)
              setMonth(dayjs(normalized).startOf('month').toDate())
              setOpen(false)
            }}
            month={resolvedMonth}
            onMonthChange={setMonth}
            fixedWeeks
            className="mx-auto p-0 [--cell-size:--spacing(9.5)]"
            captionLayout="dropdown"
          />
          <div className="border-border flex min-w-0 flex-col gap-2 border-t px-2.5 py-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground w-full justify-center"
              disabled={disabled || value == null}
              onClick={() => {
                onChange(undefined)
                setMonth(undefined)
                setOpen(false)
              }}
            >
              Clear date
            </Button>
            <div className="flex min-w-0 flex-wrap gap-2">
              {DATE_PRESETS.map((preset) => (
                <Button
                  key={preset.label}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  disabled={disabled}
                  onClick={() => {
                    const nextDate = dayjs()
                      .add(preset.daysFromToday, 'day')
                      .startOf('day')
                      .toDate()
                    onChange(nextDate)
                    setMonth(dayjs(nextDate).startOf('month').toDate())
                    setOpen(false)
                  }}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    )
  },
)

DatePicker.displayName = 'DatePicker'

export { DatePicker, type DatePickerProps }

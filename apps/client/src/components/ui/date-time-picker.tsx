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
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

const HOURS = Array.from({ length: 24 }, (_, index) => index).reverse()

type DateTimePickerProps = {
  value?: Date | null
  onChange: (value: Date | undefined) => void
  disabled?: boolean
  minuteStep?: number
  placeholder?: string
  className?: string
}

function getMinuteOptions(minuteStep: number) {
  const step = Math.max(1, Math.min(30, minuteStep))
  const count = Math.floor(60 / step)

  return Array.from({ length: count }, (_, index) => index * step)
}

const DateTimePicker = forwardRef<HTMLButtonElement, DateTimePickerProps>(
  (
    {
      value,
      onChange,
      disabled,
      minuteStep = 5,
      placeholder = 'MM/DD/YYYY HH:mm',
      className,
    },
    ref,
  ) => {
    const [open, setOpen] = useState(false)
    const [month, setMonth] = useState<Date | undefined>(undefined)
    const minutes = getMinuteOptions(minuteStep)

    const resolvedMonth =
      month ??
      dayjs(value ?? new Date())
        .startOf('month')
        .toDate()

    function handleDateSelect(date: Date | undefined) {
      if (!date) {
        return
      }

      const current = value ?? new Date()
      const nextDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        current.getHours(),
        current.getMinutes(),
        0,
        0,
      )

      onChange(nextDate)
      setMonth(dayjs(nextDate).startOf('month').toDate())
    }

    function handleTimeChange(type: 'hour' | 'minute', nextValue: string) {
      const currentDate = value ?? new Date()
      const nextDate = new Date(currentDate)

      if (type === 'hour') {
        nextDate.setHours(Number.parseInt(nextValue, 10))
      } else {
        nextDate.setMinutes(Number.parseInt(nextValue, 10))
      }

      onChange(nextDate)
      setMonth(dayjs(nextDate).startOf('month').toDate())
    }

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild disabled={disabled}>
          <Button
            ref={ref}
            type="button"
            variant="outline"
            className={cn(
              'w-full justify-start pl-3 font-normal',
              !value && 'text-muted-foreground',
              className,
            )}
            disabled={disabled}
          >
            <CalendarIcon className="size-4" />
            {value ? dayjs(value).format('MM/DD/YYYY HH:mm') : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto gap-0 p-0" align="start">
          <div className="sm:flex">
            <Calendar
              mode="single"
              selected={value ?? undefined}
              onSelect={handleDateSelect}
              month={resolvedMonth}
              onMonthChange={setMonth}
              fixedWeeks
              className="mx-auto p-0 [--cell-size:--spacing(9.5)]"
              captionLayout="dropdown"
            />
            <div className="flex flex-col divide-y sm:h-[300px] sm:flex-row sm:divide-x sm:divide-y-0">
              <ScrollArea className="w-64 sm:w-auto">
                <div className="flex p-2 sm:flex-col">
                  {HOURS.map((hour) => (
                    <Button
                      key={hour}
                      type="button"
                      size="icon"
                      variant={
                        value && value.getHours() === hour ? 'default' : 'ghost'
                      }
                      className="aspect-square shrink-0 sm:w-full"
                      onClick={() => handleTimeChange('hour', hour.toString())}
                    >
                      {hour}
                    </Button>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" className="sm:hidden" />
              </ScrollArea>
              <ScrollArea className="w-64 sm:w-auto">
                <div className="flex p-2 sm:flex-col">
                  {minutes.map((minute) => (
                    <Button
                      key={minute}
                      type="button"
                      size="icon"
                      variant={
                        value && value.getMinutes() === minute
                          ? 'default'
                          : 'ghost'
                      }
                      className="aspect-square shrink-0 sm:w-full"
                      onClick={() =>
                        handleTimeChange('minute', minute.toString())
                      }
                    >
                      {minute.toString().padStart(2, '0')}
                    </Button>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" className="sm:hidden" />
              </ScrollArea>
            </div>
          </div>
          <div className="border-border flex flex-col gap-2 border-t px-2.5 py-2">
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
              Clear date & time
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    )
  },
)

DateTimePicker.displayName = 'DateTimePicker'

export { DateTimePicker, type DateTimePickerProps }

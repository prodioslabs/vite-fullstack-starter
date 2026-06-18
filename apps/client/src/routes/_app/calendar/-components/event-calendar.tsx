import dayjs from 'dayjs'
import { useState } from 'react'
import {
  Calendar,
  dayjsLocalizer,
  type SlotInfo,
  type View,
} from 'react-big-calendar'

import CalendarToolbar from './calendar-toolbar'
import CreateEventDialog from './create-event-dialog'

import { cn, type WithBasicProps } from '@/lib/utils'

import './shadcn-big-calendar.css'

const localizer = dayjsLocalizer(dayjs)

export type CalendarEvent = {
  id: string
  title: string
  start: Date
  end: Date
  allDay?: boolean
}

type EventCalendarProps = WithBasicProps<{
  events: CalendarEvent[]
  date: Date
  view: View
  onCalendarChange: (updates: { date?: Date; view?: View }) => void
}>

export default function EventCalendar({
  className,
  style,
  events,
  date,
  view,
  onCalendarChange,
}: EventCalendarProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<
    { start: Date; end: Date; isAllDay?: boolean } | undefined
  >()

  const openCreateDialog = (slot?: {
    start: Date
    end: Date
    isAllDay?: boolean
  }) => {
    setSelectedSlot(slot)
    setCreateDialogOpen(true)
  }

  const handleSelectSlot = (slotInfo: SlotInfo) => {
    openCreateDialog({
      start: slotInfo.start,
      end: slotInfo.end,
      isAllDay: view === 'month',
    })
  }

  return (
    <>
      <div className={cn('min-h-[600px]', className)} style={style}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          className="h-full!"
          date={date}
          view={view}
          views={['month', 'week', 'day']}
          selectable
          components={{
            toolbar: (toolbarProps) => (
              <CalendarToolbar
                {...toolbarProps}
                onCreateEvent={() => openCreateDialog()}
              />
            ),
          }}
          messages={{
            today: 'Today',
            previous: 'Back',
            next: 'Next',
          }}
          onNavigate={(nextDate) => {
            onCalendarChange({ date: nextDate })
          }}
          onView={(nextView) => {
            onCalendarChange({ view: nextView })
          }}
          onDrillDown={(nextDate, nextView) => {
            onCalendarChange({ date: nextDate, view: nextView })
          }}
          onSelectSlot={handleSelectSlot}
        />
      </div>

      <CreateEventDialog
        key={
          selectedSlot
            ? `${selectedSlot.start.toISOString()}-${selectedSlot.end.toISOString()}`
            : 'default'
        }
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        defaultSlot={selectedSlot}
      />
    </>
  )
}

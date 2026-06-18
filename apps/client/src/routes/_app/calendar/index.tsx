import { createFileRoute, Link } from '@tanstack/react-router'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { CalendarIcon } from 'lucide-react'
import type { View } from 'react-big-calendar'
import * as z from 'zod'

import EventCalendar, { type CalendarEvent } from './-components/event-calendar'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { PageContainer } from '@/components/ui/page-container'
import { PageHeader } from '@/components/ui/page-header'
import { getEventsFromQueryClient } from '@/hooks/use-events'

dayjs.extend(customParseFormat)

const calendarViews = ['month', 'week', 'work_week', 'day', 'agenda'] as const

const calendarSearchSchema = z.object({
  date: z
    .string()
    .default(() => dayjs().format('YYYY-MM-DD'))
    .transform((value) => {
      const parsed = dayjs(value, 'YYYY-MM-DD', true)
      return parsed.isValid()
        ? parsed.format('YYYY-MM-DD')
        : dayjs().format('YYYY-MM-DD')
    }),
  view: z.enum(calendarViews).default('month'),
})

export const Route = createFileRoute('/_app/calendar/')({
  validateSearch: calendarSearchSchema,
  loader: () => getEventsFromQueryClient(),
  component: CalendarPage,
})

function CalendarPage() {
  const { date, view } = Route.useSearch()
  const { events } = Route.useLoaderData()
  const navigate = Route.useNavigate()

  const calendarEvents = toCalendarEvents(events)

  const handleCalendarChange = (updates: { date?: Date; view?: View }) => {
    navigate({
      search: (prev) => ({
        date: updates.date
          ? dayjs(updates.date).format('YYYY-MM-DD')
          : prev.date,
        view: updates.view ?? prev.view,
      }),
    })
  }

  return (
    <PageContainer className="h-[calc(100dvh-var(--header-height))]">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Calendar</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <PageHeader
        icon={<CalendarIcon />}
        title="Calendar"
        description="View and manage your upcoming events"
      />
      <EventCalendar
        className="flex-1"
        events={calendarEvents}
        date={dayjs(date, 'YYYY-MM-DD').toDate()}
        view={view}
        onCalendarChange={handleCalendarChange}
      />
    </PageContainer>
  )
}

function toCalendarEvents(
  events: Awaited<ReturnType<typeof getEventsFromQueryClient>>['events'],
): CalendarEvent[] {
  return events
    .filter((event) => event.eventStatus === 'active')
    .map((event) => ({
      id: event.id,
      title: event.name,
      start: new Date(event.startTime),
      end: event.isEventAllDay
        ? dayjs(event.startTime).add(1, 'day').toDate()
        : new Date(event.endTime ?? event.startTime),
      allDay: event.isEventAllDay,
    }))
}

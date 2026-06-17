import type { ToolbarProps, View, ViewsProps } from 'react-big-calendar'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function getViewNames(views: ViewsProps): View[] {
  if (Array.isArray(views)) {
    return views
  }

  return (Object.entries(views) as [View, boolean | unknown][])
    .filter(([, value]) => Boolean(value))
    .map(([name]) => name)
}

type CalendarToolbarProps<T extends object = object> = ToolbarProps<T> & {
  onCreateEvent?: () => void
}

export default function CalendarToolbar<T extends object = object>({
  label,
  localizer,
  onNavigate,
  onView,
  view,
  views,
  onCreateEvent,
}: CalendarToolbarProps<T>) {
  const viewNames = getViewNames(views)
  const { today, previous, next } = localizer.messages

  return (
    <div className="rbc-toolbar">
      <span className="rbc-btn-group">
        <button type="button" onClick={() => onNavigate('TODAY')}>
          {today}
        </button>
        <button type="button" onClick={() => onNavigate('PREV')}>
          {previous}
        </button>
        <button type="button" onClick={() => onNavigate('NEXT')}>
          {next}
        </button>
      </span>
      <span className="rbc-toolbar-label">{label}</span>
      <span className="flex items-center gap-2">
        {viewNames.length > 1 ? (
          <span className="rbc-btn-group">
            {viewNames.map((name) => (
              <button
                key={name}
                type="button"
                className={cn(view === name && 'rbc-active')}
                onClick={() => onView(name)}
              >
                {localizer.messages[name]}
              </button>
            ))}
          </span>
        ) : null}
        {onCreateEvent ? (
          <Button type="button" size="sm" onClick={onCreateEvent}>
            Create event
          </Button>
        ) : null}
      </span>
    </div>
  )
}

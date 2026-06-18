import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { DatePicker } from '@/components/ui/date-picker'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { TimePicker } from '@/components/ui/time-picker'
import { EVENTS_KEY } from '@/hooks/use-events'
import { getDataOrThrow, honoClient } from '@/lib/hono'
import { cn, getErrorMessage } from '@/lib/utils'

const createEventSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    isEventAllDay: z.boolean(),
    startTime: z.string().min(1, 'Start time is required'),
    endTime: z.string().optional(),
    conferenceLink: z.url().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.isEventAllDay && !data.endTime) {
      ctx.addIssue({
        code: 'custom',
        message: 'End time is required',
        path: ['endTime'],
      })
    }

    if (
      !data.isEventAllDay &&
      data.endTime &&
      !dayjs(data.endTime).isAfter(dayjs(data.startTime))
    ) {
      ctx.addIssue({
        code: 'custom',
        message: 'End time must be after start time',
        path: ['endTime'],
      })
    }
  })

type CreateEventValues = z.infer<typeof createEventSchema>

type CreateEventDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultSlot?: {
    start: Date
    end: Date
    isAllDay?: boolean
  }
}

export default function CreateEventDialog({
  open,
  onOpenChange,
  defaultSlot,
}: CreateEventDialogProps) {
  const router = useRouter()
  const queryClient = useQueryClient()

  const form = useForm<CreateEventValues>({
    resolver: zodResolver(createEventSchema),
    defaultValues: getDefaultValues(defaultSlot),
  })

  const isEventAllDay = useWatch<CreateEventValues, 'isEventAllDay'>({
    control: form.control,
    name: 'isEventAllDay',
  })

  const createEventMutation = useMutation({
    mutationFn: (values: CreateEventValues) =>
      getDataOrThrow(
        honoClient.api.event.$post({ json: toCreateEventPayload(values) }),
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: EVENTS_KEY })
      await router.invalidate()
    },
  })

  const handleSubmit = (values: CreateEventValues) => {
    void toast
      .promise(createEventMutation.mutateAsync(values), {
        loading: 'Creating event...',
        success: 'Event created',
        error: (error) => ({
          message: 'Unable to create event',
          description: getErrorMessage(error),
        }),
      })
      .unwrap()
      .then(() => {
        form.reset(getDefaultValues())
        onOpenChange(false)
      })
      .catch((error: unknown) => {
        form.setError('name', {
          message: getErrorMessage(error),
        })
      })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create event</DialogTitle>
          <DialogDescription>
            Add a new event to your calendar.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            className="flex flex-col gap-4"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Team sync"
                      autoComplete="off"
                      disabled={createEventMutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <textarea
                      {...field}
                      rows={3}
                      placeholder="Optional details about this event"
                      disabled={createEventMutation.isPending}
                      className={cn(
                        'border-input placeholder:text-muted-foreground flex min-h-20 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
                      )}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isEventAllDay"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start gap-3">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={createEventMutation.isPending}
                    />
                  </FormControl>
                  <div className="flex flex-col gap-1">
                    <FormLabel className="font-normal">All-day event</FormLabel>
                    <FormDescription>
                      Show this event across the full day.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              {isEventAllDay ? (
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel required>Start date</FormLabel>
                      <FormControl>
                        <DatePicker
                          value={
                            field.value
                              ? dayjs(field.value).toDate()
                              : undefined
                          }
                          onChange={(date) => {
                            field.onChange(date ? toDateValue(date) : '')
                          }}
                          disabled={createEventMutation.isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <div className="grid gap-4 sm:col-span-2 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <>
                        <FormItem className="sm:col-span-2">
                          <FormLabel required>Date</FormLabel>
                          <FormControl>
                            <DatePicker
                              value={
                                field.value
                                  ? dayjs(field.value).toDate()
                                  : undefined
                              }
                              onChange={(date) => {
                                if (!date) {
                                  return
                                }

                                const nextStart = combineDateAndTime(
                                  date,
                                  getTimeFromDatetime(field.value),
                                )
                                const endTime = form.getValues('endTime')
                                const nextEnd = endTime
                                  ? combineDateAndTime(
                                      date,
                                      getTimeFromDatetime(endTime),
                                    )
                                  : undefined

                                field.onChange(nextStart)
                                if (nextEnd) {
                                  form.setValue('endTime', nextEnd)
                                }
                              }}
                              disabled={createEventMutation.isPending}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>

                        <FormItem>
                          <FormLabel required>Start time</FormLabel>
                          <FormControl>
                            <TimePicker
                              value={
                                field.value
                                  ? getTimeFromDatetime(field.value)
                                  : ''
                              }
                              onChange={(event) => {
                                const date = dayjs(field.value)
                                  .startOf('day')
                                  .toDate()

                                field.onChange(
                                  combineDateAndTime(date, event.target.value),
                                )
                              }}
                              disabled={createEventMutation.isPending}
                            />
                          </FormControl>
                        </FormItem>
                      </>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel required>End time</FormLabel>
                        <FormControl>
                          <TimePicker
                            value={
                              field.value
                                ? getTimeFromDatetime(field.value)
                                : ''
                            }
                            onChange={(event) => {
                              const startTime = form.getValues('startTime')
                              const date = dayjs(startTime)
                                .startOf('day')
                                .toDate()

                              field.onChange(
                                combineDateAndTime(date, event.target.value),
                              )
                            }}
                            disabled={createEventMutation.isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>

            <FormField
              control={form.control}
              name="conferenceLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conference link</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="url"
                      placeholder="https://meet.example.com/room"
                      autoComplete="off"
                      disabled={createEventMutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="submit"
                loading={createEventMutation.isPending}
                disabled={createEventMutation.isPending}
              >
                Create event
              </Button>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

function getDefaultValues(slot?: {
  start: Date
  end: Date
  isAllDay?: boolean
}): CreateEventValues {
  if (slot?.isAllDay) {
    return {
      name: '',
      description: '',
      isEventAllDay: true,
      startTime: toDateValue(slot.start),
      endTime: undefined,
      conferenceLink: '',
    }
  }

  const start = slot?.start ?? dayjs().startOf('hour').add(1, 'hour').toDate()
  const end = slot?.end ?? dayjs(start).add(1, 'hour').toDate()

  return {
    name: '',
    description: '',
    isEventAllDay: false,
    startTime: toDatetimeLocalValue(start),
    endTime: toDatetimeLocalValue(end),
    conferenceLink: '',
  }
}

function toDateValue(date: Date) {
  return dayjs(date).format('YYYY-MM-DD')
}

function toDatetimeLocalValue(date: Date) {
  return dayjs(date).format('YYYY-MM-DDTHH:mm')
}

function getTimeFromDatetime(value: string) {
  return dayjs(value).format('HH:mm')
}

function combineDateAndTime(date: Date, time: string) {
  const [hours, minutes] = time.split(':').map(Number)

  return dayjs(date)
    .hour(hours)
    .minute(minutes)
    .second(0)
    .millisecond(0)
    .format('YYYY-MM-DDTHH:mm')
}

function toCreateEventPayload(values: CreateEventValues) {
  const description = values.description?.trim()
  const conferenceLink = values.conferenceLink?.trim()

  if (values.isEventAllDay) {
    return {
      name: values.name.trim(),
      description: description || undefined,
      isEventAllDay: true as const,
      startTime: dayjs(values.startTime).startOf('day').toDate(),
      conferenceLink: conferenceLink || undefined,
    }
  }

  return {
    name: values.name.trim(),
    description: description || undefined,
    isEventAllDay: false as const,
    startTime: new Date(values.startTime),
    endTime: new Date(values.endTime!),
    conferenceLink: conferenceLink || undefined,
  }
}

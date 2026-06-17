import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import 'react-image-crop/dist/ReactCrop.css'
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  type Crop,
} from 'react-image-crop'
import { toast } from 'sonner'
import { match } from 'ts-pattern'
import * as z from 'zod'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ErrorMessage } from '@/components/ui/error-message'
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
import { Skeleton } from '@/components/ui/skeleton'
import { authClient, type User } from '@/lib/auth'
import { getImageSize } from '@/lib/image'
import { getUploadedFileUrl, uploadImage } from '@/lib/upload'
import { getErrorMessage, getInitials } from '@/lib/utils'

const MAX_AVATAR_SIZE_IN_BYTES = 1024 * 1024

const updatePersonalInfoSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.email('Enter a valid email'),
})

type UpdatePersonalInfoValues = z.infer<typeof updatePersonalInfoSchema>

const SESSION_QUERY_KEY = ['auth', 'session'] as const

export default function UpdatePersonalInfoForm() {
  const sessionQuery = useQuery({
    queryKey: SESSION_QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await authClient.getSession()

      if (error) {
        throw error
      }

      if (!data?.user) {
        throw new Error('Session not found')
      }

      return data.user
    },
  })

  return match(sessionQuery)
    .returnType<React.ReactNode>()
    .with({ status: 'pending' }, () => <UpdatePersonalInfoFormSkeleton />)
    .with({ status: 'success' }, ({ data }) => (
      <UpdatePersonalInfoFormFields key={data.name} user={data} />
    ))
    .with({ status: 'error' }, ({ error, refetch }) => (
      <ErrorMessage
        title="Unable to load personal information"
        error={error}
        onReset={() => void refetch()}
        showBackHomeLink={false}
      />
    ))
    .otherwise(() => null)
}

type UpdatePersonalInfoFormFieldsProps = {
  user: User
}

function UpdatePersonalInfoFormFields({
  user,
}: UpdatePersonalInfoFormFieldsProps) {
  const router = useRouter()
  const queryClient = useQueryClient()

  const form = useForm<UpdatePersonalInfoValues>({
    resolver: zodResolver(updatePersonalInfoSchema),
    defaultValues: toFormValues(user),
  })

  const updatePersonalInfoMutation = useMutation({
    mutationFn: async ({ firstName, lastName }: UpdatePersonalInfoValues) => {
      const result = await authClient.updateUser(
        {
          name: [firstName.trim(), lastName.trim()].filter(Boolean).join(' '),
        },
        {
          onError({ error }) {
            throw error
          },
        },
      )

      if (result.error) {
        throw new Error(result.error.message)
      }

      return result
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY })
      await router.invalidate()
    },
  })

  const handleSubmit = (values: UpdatePersonalInfoValues) => {
    void toast
      .promise(updatePersonalInfoMutation.mutateAsync(values), {
        loading: 'Updating personal information...',
        success: 'Personal information updated',
        error: (error) => ({
          message: 'Unable to update personal information',
          description: getErrorMessage(error),
        }),
      })
      .unwrap()
      .then(() => form.reset(values))
      .catch((error: unknown) => {
        form.setError('firstName', {
          message: getErrorMessage(error),
        })
      })
  }

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-6"
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        <PersonalInfoAvatar key={user.image ?? 'no-image'} user={user} />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Jane"
                    autoComplete="given-name"
                    disabled={updatePersonalInfoMutation.isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Doe"
                    autoComplete="family-name"
                    disabled={updatePersonalInfoMutation.isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  disabled
                />
              </FormControl>
              <FormDescription>
                Contact support to change your email address.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <Button type="submit" loading={updatePersonalInfoMutation.isPending}>
            Update personal information
          </Button>
        </div>
      </form>
    </Form>
  )
}

type PersonalInfoAvatarProps = {
  user: User
}

function PersonalInfoAvatar({ user }: PersonalInfoAvatarProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [cropFile, setCropFile] = useState<File | null>(null)
  const [crop, setCrop] = useState<Crop>()
  const cropFileUrl = useMemo(
    () => (cropFile ? URL.createObjectURL(cropFile) : undefined),
    [cropFile],
  )

  const uploadAvatarMutation = useMutation({
    mutationFn: async ({
      file,
      crop,
    }: {
      file: File
      crop: {
        unit: '%' | 'px'
        width: number
        height: number
        x: number
        y: number
      }
    }) => {
      const uploaded = await uploadImage(file, crop)
      const result = await authClient.updateUser(
        { image: getUploadedFileUrl(uploaded) },
        {
          onError({ error }) {
            throw error
          },
        },
      )

      if (result.error) {
        throw new Error(result.error.message)
      }

      return result
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY })
      await router.invalidate()
    },
  })

  const removeAvatarMutation = useMutation({
    mutationFn: async () => {
      const result = await authClient.updateUser(
        { image: null },
        {
          onError({ error }) {
            throw error
          },
        },
      )

      if (result.error) {
        throw new Error(result.error.message)
      }

      return result
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY })
      await router.invalidate()
    },
  })

  const isAvatarPending =
    uploadAvatarMutation.isPending || removeAvatarMutation.isPending

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) {
      return
    }

    if (file.size > MAX_AVATAR_SIZE_IN_BYTES) {
      toast.error('File size exceeded', {
        description: 'Maximum file size of 1MB is allowed',
      })
      return
    }

    try {
      const { width, height } = await getImageSize(file)
      const nextCrop = centerCrop(
        makeAspectCrop({ unit: '%', width: 50 }, 1, width, height),
        width,
        height,
      )

      setCrop(nextCrop)
      setCropFile(file)
    } catch (error) {
      toast.error('Unable to load image', {
        description: getErrorMessage(error),
      })
    }
  }

  const handleUploadAvatar = () => {
    if (!cropFile || !crop) {
      return
    }

    void toast
      .promise(
        uploadAvatarMutation.mutateAsync({
          file: cropFile,
          crop: {
            unit: crop.unit,
            width: crop.width,
            height: crop.height,
            x: crop.x,
            y: crop.y,
          },
        }),
        {
          loading: 'Uploading avatar...',
          success: 'Avatar updated',
          error: (error) => ({
            message: 'Unable to update avatar',
            description: getErrorMessage(error),
          }),
        },
      )
      .unwrap()
      .then(() => {
        setCropFile(null)
        setCrop(undefined)
      })
  }

  const handleRemoveAvatar = () => {
    void toast.promise(removeAvatarMutation.mutateAsync(), {
      loading: 'Removing avatar...',
      success: 'Avatar removed',
      error: (error) => ({
        message: 'Unable to remove avatar',
        description: getErrorMessage(error),
      }),
    })
  }

  return (
    <>
      <div className="flex items-start gap-6">
        <Avatar className="size-16 rounded-lg after:rounded-lg">
          <AvatarImage
            src={user.image ?? undefined}
            alt={user.name}
            className="rounded-lg"
          />
          <AvatarFallback className="rounded-lg text-base">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isAvatarPending}
              onClick={() => fileInputRef.current?.click()}
            >
              Change avatar
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isAvatarPending || !user.image}
              loading={removeAvatarMutation.isPending}
              onClick={handleRemoveAvatar}
            >
              Remove avatar
            </Button>
          </div>
          <p className="text-muted-foreground text-sm/relaxed">
            JPG or PNG. 1MB max.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg"
            className="hidden"
            onChange={(event) => void handleFileChange(event)}
          />
        </div>
      </div>

      <Dialog
        open={!!cropFile}
        onOpenChange={(open) => {
          if (!open) {
            setCropFile(null)
            setCrop(undefined)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crop avatar</DialogTitle>
            <DialogDescription>
              Crop the image before uploading your avatar.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center overflow-hidden rounded-md">
            {cropFileUrl ? (
              <ReactCrop
                crop={crop}
                onChange={setCrop}
                onComplete={(_, value) => {
                  setCrop(value)
                }}
                aspect={1}
                className="max-h-[400px]"
              >
                <img src={cropFileUrl} alt="Avatar crop preview" />
              </ReactCrop>
            ) : null}
          </div>
          <DialogFooter>
            <Button
              type="button"
              onClick={handleUploadAvatar}
              loading={uploadAvatarMutation.isPending}
              disabled={uploadAvatarMutation.isPending}
            >
              Upload
            </Button>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function toFormValues(user: User): UpdatePersonalInfoValues {
  const parts = user.name.trim().split(/\s+/)
  const firstName = parts[0] ?? ''
  const lastName = parts.slice(1).join(' ')

  return {
    firstName,
    lastName,
    email: user.email,
  }
}

function UpdatePersonalInfoFormSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-6">
        <Skeleton className="size-16 rounded-lg" />
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Skeleton className="h-8 w-28" />
            <Skeleton className="h-8 w-28" />
          </div>
          <Skeleton className="h-4 w-40" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-full" />
        </div>
        <div className="grid gap-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-full" />
        </div>
      </div>
      <div className="grid gap-1">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-8 w-full" />
      </div>
      <Skeleton className="h-8 w-52" />
    </div>
  )
}

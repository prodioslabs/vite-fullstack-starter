import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { match } from 'ts-pattern'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import { ErrorMessage } from '@/components/ui/error-message'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { authClient } from '@/lib/auth'
import { getErrorMessage } from '@/lib/utils'

const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

type UpdatePasswordValues = z.infer<typeof updatePasswordSchema>

const ACCOUNTS_QUERY_KEY = ['auth', 'accounts'] as const

export default function UpdatePasswordForm() {
  const accountsQuery = useQuery({
    queryKey: ACCOUNTS_QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await authClient.listAccounts()

      if (error) {
        throw error
      }

      return data
    },
  })

  const form = useForm<UpdatePasswordValues>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const updatePasswordMutation = useMutation({
    mutationFn: async ({
      currentPassword,
      newPassword,
    }: UpdatePasswordValues) => {
      const result = await authClient.changePassword(
        {
          currentPassword,
          newPassword,
          revokeOtherSessions: true,
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
  })

  const handleSubmit = (values: UpdatePasswordValues) => {
    void toast
      .promise(updatePasswordMutation.mutateAsync(values), {
        loading: 'Updating password...',
        success: 'Password updated',
        error: (error) => ({
          message: 'Unable to update password',
          description: getErrorMessage(error),
        }),
      })
      .unwrap()
      .then(() => form.reset())
      .catch((error: unknown) => {
        form.setError('currentPassword', {
          message: getErrorMessage(error),
        })
      })
  }

  return match(accountsQuery)
    .returnType<React.ReactNode>()
    .with({ status: 'pending' }, () => <UpdatePasswordFormSkeleton />)
    .with({ status: 'success' }, ({ data }) => {
      const hasCredentialAccount = data.some(
        (account) => account.providerId === 'credential',
      )
      const formDisabled = !hasCredentialAccount

      return (
        <div className="flex flex-col gap-6">
          {!hasCredentialAccount ? (
            <p className="text-muted-foreground text-sm/relaxed">
              Password changes are unavailable because your account has no email
              and password credential. If you sign in with Google or another
              provider, continue using that to access your account.
            </p>
          ) : null}

          <Form {...form}>
            <form
              className="flex flex-col gap-4"
              onSubmit={form.handleSubmit(handleSubmit)}
            >
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current password</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="••••••••"
                        autoComplete="current-password"
                        disabled={
                          formDisabled || updatePasswordMutation.isPending
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New password</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder="••••••••"
                          autoComplete="new-password"
                          disabled={
                            formDisabled || updatePasswordMutation.isPending
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm password</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder="••••••••"
                          autoComplete="new-password"
                          disabled={
                            formDisabled || updatePasswordMutation.isPending
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div>
                <Button
                  type="submit"
                  loading={updatePasswordMutation.isPending}
                  disabled={formDisabled}
                >
                  Update password
                </Button>
              </div>
            </form>
          </Form>
        </div>
      )
    })
    .with({ status: 'error' }, ({ error, refetch }) => (
      <ErrorMessage
        title="Unable to load password settings"
        error={error}
        onReset={() => void refetch()}
        showBackHomeLink={false}
      />
    ))
    .otherwise(() => null)
}

function UpdatePasswordFormSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-1">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-full" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-8 w-full" />
        </div>
        <div className="grid gap-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-full" />
        </div>
      </div>
      <Skeleton className="h-8 w-36" />
    </div>
  )
}

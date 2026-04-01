import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { authClient } from '@/lib/auth-client'
import { getErrorMessage } from '@/lib/utils'

const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>

export const Route = createFileRoute('/_auth/reset-password')({
  component: ResetPassword,
  validateSearch: z.object({
    token: z.string().min(1, 'Token is required'),
  }),
  errorComponent: () => {
    return (
      <div className="flex w-full max-w-md flex-col gap-3 rounded-lg border bg-card p-8 text-center shadow">
        <div className="text-2xl font-semibold text-foreground">
          Invalid password reset link
        </div>
        <div className="text-sm text-muted-foreground">
          The password reset link is missing or invalid. Please request a new
          one.
        </div>
        <Link
          to="/forgot-password"
          className="inline-block text-primary font-medium"
        >
          Request new link
        </Link>
      </div>
    )
  },
})

function ResetPassword() {
  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
    },
  })

  const { token } = Route.useSearch()

  const resetPassword = useMutation({
    mutationFn: async (values: ResetPasswordValues) => {
      const res = await authClient.resetPassword({
        newPassword: values.password,
        token,
      })

      if (res.error) {
        throw new Error(res.error.message)
      }

      return res
    },
    onSuccess: () => {
      toast.success('Password reset successfully')
    },
    onError: (error) => {
      const errorMessage = getErrorMessage(error)

      toast.error('Unable to reset password:', {
        description: errorMessage,
      })
    },
  })

  return (
    <div className="flex w-full max-w-md flex-col gap-3 rounded-lg border bg-card p-8 shadow">
      <div className="space-y-2">
        <div className="text-2xl font-semibold text-foreground">
          Set a new password
        </div>
        <div className="text-sm text-muted-foreground">
          Enter your new password to finish resetting your account.
        </div>
      </div>

      <Form {...form}>
        <form
          className="space-y-6"
          onSubmit={form.handleSubmit((values) => {
            resetPassword.mutate(values)
          })}
        >
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New password</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            loading={resetPassword.isPending}
            disabled={resetPassword.isPending}
          >
            Reset password
          </Button>
        </form>
      </Form>

      {resetPassword.status === 'success' ? (
        <div className="text-sm text-muted-foreground">
          Password reset successfully. You can now login with your new password.
          <Link to="/login" className="ml-2 text-primary font-medium">
            Login
          </Link>
        </div>
      ) : null}
    </div>
  )
}

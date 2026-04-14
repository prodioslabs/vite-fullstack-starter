import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'
import { useRef } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import {
  CaptchaInput,
  type CaptchaInputRef,
} from '@/components/ui/captcha-input'
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
import { Logo } from '@/components/ui/logo'
import { authClient } from '@/lib/auth-client'
import { getErrorMessage } from '@/lib/utils'

const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  captcha: z.string().min(6, 'Captcha is required'),
})

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>

export const Route = createFileRoute('/_auth/reset-password')({
  head: () => ({ meta: [{ title: 'Reset Password | Fullstack Starter' }] }),
  component: ResetPassword,
  validateSearch: z.object({
    email: z.email(),
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
  const captchaInputRef = useRef<CaptchaInputRef>(null)

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      captcha: '',
    },
  })

  const { token, email } = Route.useSearch()

  const resetPassword = useMutation({
    mutationFn: async ({ captcha, password }: ResetPasswordValues) => {
      if (!captchaInputRef.current) {
        return
      }
      const problem = captchaInputRef.current.getProblem()

      const res = await authClient.resetPassword(
        { newPassword: password, token },
        {
          headers: {
            'X-Captcha-Problem': problem,
            'X-Captcha-Solution': captcha,
          },
          onError({ error }) {
            throw error
          },
        },
      )

      if (res.error) {
        throw new Error(res.error.message)
      }

      return res
    },
    onSuccess: () => {
      toast.success('Password reset successfully')
      form.reset()
    },
    onError: (error) => {
      const errorMessage = getErrorMessage(error)

      toast.error('Unable to reset password:', {
        description: errorMessage,
      })

      form.setError('password', { message: errorMessage })
      form.setValue('captcha', '')
    },
  })

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Logo className="size-10 mx-auto mb-2" />
        <div className="text-xl font-semibold text-foreground text-center">
          Set a new password
        </div>
        <div className="text-sm text-muted-foreground">
          Enter your new password to finish resetting your account.
        </div>
      </div>

      <Form {...form}>
        <form
          className="space-y-4 border rounded-xl p-4 flex-1"
          onSubmit={form.handleSubmit((values) => {
            resetPassword.mutate(values)
          })}
        >
          <input className="hidden" hidden value={email} disabled />
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
          <FormField
            control={form.control}
            name="captcha"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>Captcha</FormLabel>
                  <FormDescription>Captcha is case sensitive</FormDescription>
                  <FormControl>
                    <CaptchaInput
                      value={field.value}
                      onChange={field.onChange}
                      ref={captchaInputRef}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )
            }}
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
        <div className="text-sm text-muted-foreground text-center">
          Password reset successfully.
          <div>
            You can now{' '}
            <Link to="/login" className="text-primary font-medium">
              Login
            </Link>{' '}
            with your new password.
          </div>
        </div>
      ) : null}
    </div>
  )
}

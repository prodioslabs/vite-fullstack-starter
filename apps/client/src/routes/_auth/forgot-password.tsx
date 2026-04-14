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
import { authClient } from '@/lib/auth'
import { getErrorMessage } from '@/lib/utils'

const forgotPasswordSchema = z.object({
  email: z.email('Enter a valid email'),
  captcha: z.string().min(6, 'Captcha required'),
})

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>

export const Route = createFileRoute('/_auth/forgot-password')({
  head: () => ({ meta: [{ title: 'Reset Password | Fullstack Starter' }] }),
  component: ForgotPassword,
})

function ForgotPassword() {
  const captchaInputRef = useRef<CaptchaInputRef>(null)

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
      captcha: '',
    },
  })

  const requestReset = useMutation({
    mutationFn: async ({ captcha, ...values }: ForgotPasswordValues) => {
      if (!captchaInputRef.current) {
        return
      }
      const problem = captchaInputRef.current.getProblem()
      const result = await authClient.requestPasswordReset(values, {
        headers: {
          'X-Captcha-Problem': problem,
          'X-Captcha-Solution': captcha,
        },
        onError({ error }) {
          throw error
        },
      })

      if (result.error) {
        throw new Error(result.error.message)
      }

      return result
    },
    onSuccess: (_, { email }) => {
      toast.success('Reset password email sent', {
        description: `Check your ${email} inbox.`,
      })
    },
    onError: (error) => {
      const errorMessage = getErrorMessage(error)

      toast.error('Unable to send reset link:', {
        description: errorMessage,
      })
      form.setError('email', { message: errorMessage })
    },
  })

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <Logo className="size-10 mx-auto" />
        <div className="text-xl font-semibold text-foreground text-center">
          Reset password
        </div>
      </div>

      <Form {...form}>
        <form
          className="space-y-4 border rounded-xl p-4 flex-1"
          onSubmit={form.handleSubmit((values) => {
            requestReset.mutate(values)
          })}
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="you@example.com"
                    type="email"
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
            loading={requestReset.isPending}
          >
            Send reset link
          </Button>
        </form>
      </Form>

      <div className="text-sm text-muted-foreground text-center">
        Remembered your password?{' '}
        <Link to="/login" className="text-primary font-medium">
          Go back to login
        </Link>
      </div>
    </div>
  )
}

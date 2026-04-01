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

const forgotPasswordSchema = z.object({
  email: z.email('Enter a valid email'),
})

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>

export const Route = createFileRoute('/_auth/forgot-password')({
  component: ForgotPassword,
})

function ForgotPassword() {
  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  const requestReset = useMutation({
    mutationFn: async (values: ForgotPasswordValues) => {
      const result = await authClient.requestPasswordReset(values)

      if (result.error) {
        throw new Error(result.error.message)
      }

      return result
    },
    onSuccess: () => {
      toast.success('If that email exists, we sent a reset link')
    },
    onError: (error) => {
      const errorMessage = getErrorMessage(error)

      toast.error('Unable to send reset link:', {
        description: errorMessage,
      })
    },
  })

  return (
    <div className="flex w-full max-w-md flex-col gap-3 rounded-lg border bg-card p-8 shadow">
      <div className="space-y-2">
        <div className="text-2xl font-semibold text-foreground">
          Reset password
        </div>
        <div className="text-sm text-muted-foreground">
          Remembered your password?{' '}
          <Link to="/login" className="text-primary font-medium">
            Go back to login
          </Link>
        </div>
      </div>

      <Form {...form}>
        <form
          className="space-y-6"
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

          <Button
            type="submit"
            className="w-full"
            loading={requestReset.isPending}
          >
            Send reset link
          </Button>
        </form>
      </Form>
    </div>
  )
}

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
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

const loginSchema = z.object({
  email: z.email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type LoginValues = z.infer<typeof loginSchema>

export const Route = createFileRoute('/_auth/login')({
  component: Login,
})

function Login() {
  const navigate = useNavigate()
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const loginMutation = useMutation({
    mutationFn: async (values: LoginValues) => {
      const result = await authClient.signIn.email(values)

      if (result.error) {
        throw new Error(result.error.message)
      }

      return result
    },
    onSuccess: async () => {
      toast.success('Signed in')
      navigate({ to: '/', replace: true })
    },
    onError: (error) => {
      const errorMessage = getErrorMessage(error)

      toast.error('Unable to sign you in:', {
        description: errorMessage,
      })
    },
  })

  return (
    <div className="flex w-full max-w-md flex-col gap-3 rounded-lg border bg-card p-8 shadow">
      <div className="space-y-2">
        <div className="text-2xl font-semibold text-foreground">Sign in</div>
        <div className="text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="text-primary font-medium">
            Register here
          </Link>
        </div>
      </div>

      <Form {...form}>
        <form
          className="space-y-6"
          onSubmit={form.handleSubmit((values) => loginMutation.mutate(values))}
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
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="••••••••" type="password" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-end text-sm">
            <Link to="/forgot-password" className="text-primary font-medium">
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full"
            loading={loginMutation.isPending}
          >
            Continue
          </Button>
        </form>
      </Form>
    </div>
  )
}

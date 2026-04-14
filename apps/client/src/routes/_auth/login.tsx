import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
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

const loginSchema = z.object({
  email: z.email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  captcha: z.string().min(6, 'Captcha required'),
})

type LoginValues = z.infer<typeof loginSchema>

export const Route = createFileRoute('/_auth/login')({
  component: Login,
  head: () => ({ meta: [{ title: 'Sign In | Fullstack Starter' }] }),
})

function Login() {
  const navigate = useNavigate()

  const captchaInputRef = useRef<CaptchaInputRef>(null)

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      captcha: '',
    },
  })

  const loginMutation = useMutation({
    mutationFn: async ({ captcha, ...values }: LoginValues) => {
      if (!captchaInputRef.current) {
        return
      }
      const problem = captchaInputRef.current.getProblem()
      const result = await authClient.signIn.email(values, {
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
    onSuccess: async () => {
      toast.success('Signed in')
      navigate({ to: '/', replace: true })
    },
    onError: (error) => {
      const errorMessage = getErrorMessage(error)
      toast.error('Unable to sign you in', {
        description: errorMessage,
      })
      form.setError('email', { message: errorMessage })
      form.setValue('captcha', '')
      captchaInputRef.current?.refetchCaptcha()
    },
  })

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <Logo className="size-10 mx-auto" />
        <div className="text-xl font-semibold text-foreground text-center">
          Sign in to your account
        </div>
      </div>

      <Form {...form}>
        <form
          className="space-y-4 border rounded-xl p-4 flex-1"
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

      <div className="space-y-2 text-center">
        <div className="text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="text-primary font-medium">
            Register here
          </Link>
        </div>
      </div>
    </div>
  )
}

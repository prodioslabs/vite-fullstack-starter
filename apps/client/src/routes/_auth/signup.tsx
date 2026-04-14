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
import { authClient } from '@/lib/auth-client'
import { getErrorMessage } from '@/lib/utils'

const signupSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  captcha: z.string().min(6, 'Captcha required'),
})

type SignupValues = z.infer<typeof signupSchema>

export const Route = createFileRoute('/_auth/signup')({
  head: () => ({ meta: [{ title: 'Sign Up | Fullstack Starter' }] }),
  component: Signup,
})

function Signup() {
  const navigate = useNavigate()

  const captchaInputRef = useRef<CaptchaInputRef>(null)

  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      captcha: '',
    },
  })

  const signupMutation = useMutation({
    mutationFn: async ({ captcha, ...values }: SignupValues) => {
      if (!captchaInputRef.current) {
        return
      }
      const problem = captchaInputRef.current.getProblem()
      const result = await authClient.signUp.email(values, {
        headers: {
          'X-Captcha-Problem': problem,
          'X-Captcha-Solution': captcha,
        },
        onError({ error }) {
          throw error
        },
      })

      if (result?.error) {
        throw new Error(result.error.message)
      }

      return result
    },
    onSuccess: async () => {
      toast.success('Account created')
      navigate({ to: '/', replace: true })
    },
    onError: (error) => {
      const errorMessage = getErrorMessage(error)

      toast.error('Unable to create your account:', {
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
          Create your account
        </div>
      </div>

      <Form {...form}>
        <form
          className="space-y-4 border rounded-xl p-4 flex-1"
          onSubmit={form.handleSubmit((values) => {
            signupMutation.mutate(values)
          })}
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Your name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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

          <Button
            type="submit"
            className="w-full"
            loading={signupMutation.isPending}
          >
            Create account
          </Button>
        </form>
      </Form>

      <div className="text-sm text-muted-foreground text-center">
        Already have an account?{' '}
        <Link to="/login" className="text-primary font-medium">
          Sign in
        </Link>
      </div>
    </div>
  )
}

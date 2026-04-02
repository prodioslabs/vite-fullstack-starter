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

const signupSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type SignupValues = z.infer<typeof signupSchema>

export const Route = createFileRoute('/_auth/signup')({
  component: Signup,
})

function Signup() {
  const navigate = useNavigate()
  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  })

  const signupMutation = useMutation({
    mutationFn: async (values: SignupValues) => {
      const result = await authClient.signUp.email(values)

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
    },
  })

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <div className="space-y-2">
        <div className="text-2xl font-semibold text-foreground">
          Create account
        </div>
        <div className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-medium">
            Sign in
          </Link>
        </div>
      </div>

      <Form {...form}>
        <form
          className="space-y-6"
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

          <Button
            type="submit"
            className="w-full"
            loading={signupMutation.isPending}
          >
            Create account
          </Button>
        </form>
      </Form>
    </div>
  )
}

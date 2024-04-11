import { Button, Form, FormControl, FormField, FormItem, FormLabel, FormMessage, Input } from '@repo/ui'
import { createLazyFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { contract } from '@repo/contract'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQueryClient } from '@tanstack/react-query'
import { Logo } from '../../components/icons'
import { client } from '../../lib/client'
import { CURRENT_USER_KEY } from '../../hooks/use-current-user'

export const Route = createLazyFileRoute('/_auth/login')({
  component: Login,
})

function Login() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const loginMutation = client.auth.login.useMutation({
    onSuccess: async ({ body }) => {
      queryClient.setQueryData(CURRENT_USER_KEY, { status: 200, body })
      navigate({ to: '/' })
    },
  })

  const form = useForm<z.infer<typeof contract.auth.login.body>>({
    resolver: zodResolver(contract.auth.login.body),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  return (
    <div className="p-8 w-full max-w-md">
      <Logo className="w-12 h-12 mb-4 text-primary" />
      <div className="font-semibold text-2xl text-foreground mb-2">Sign in to your account</div>
      <div className="text-muted-foreground text-sm mb-8">
        Don't have an account?{' '}
        <Link to="/signup" className="text-primary font-medium">
          Register here
        </Link>
      </div>
      <Form {...form}>
        <form
          className="space-y-6"
          onSubmit={form.handleSubmit(({ email, password }) => {
            loginMutation.mutate({ body: { email, password } })
          })}
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )
            }}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" placeholder="password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )
            }}
          />
          <div className="flex items-center justify-end">
            <Link to="/forgot-password" className="text-primary font-medium text-sm">
              Forgot Password?
            </Link>
          </div>
          <Button type="submit" className="w-full" loading={loginMutation.isPending}>
            Sign In
          </Button>
        </form>
      </Form>
    </div>
  )
}

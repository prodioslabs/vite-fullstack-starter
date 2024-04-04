import { Button, Form, FormControl, FormField, FormItem, FormLabel, FormMessage, Input } from '@repo/ui'
import { createLazyFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { contract } from '@repo/contract'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Logo } from '../../components/icons'
import { client, queryClient } from '../../lib/client'
import { API_TOKEN_LOCAL_STORAGE_KEY } from '../../lib/constants'
import { CURRENT_USER_KEY } from '../../hooks/use-current-user'

const formValidationSchema = contract.auth.login.body

export const Route = createLazyFileRoute('/_auth/login')({
  component: Login,
})

function Login() {
  const navigate = useNavigate()
  const loginMutation = client.auth.login.useMutation({
    onSuccess: ({ body }) => {
      window.localStorage.setItem(API_TOKEN_LOCAL_STORAGE_KEY, body.token)
      queryClient.setQueryData(CURRENT_USER_KEY, { status: 200, body: body.user })
      navigate({ to: '/' })
    },
  })

  const form = useForm<z.infer<typeof formValidationSchema>>({
    resolver: zodResolver(formValidationSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  return (
    <div className="p-8 w-full">
      <Logo className="w-12 h-12 mb-4 text-primary" />
      <div className="font-semibold text-2xl text-foreground mb-2">Sign in to your account</div>
      <div className="text-muted-foreground text-sm mb-8">
        Don't have an account?{' '}
        <Link href="/signup" className="text-primary font-medium">
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
            <Link href="/forgot-password" className="text-primary font-medium text-sm">
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

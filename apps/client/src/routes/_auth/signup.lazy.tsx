import { createLazyFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { contract } from '@repo/contract'
import { Form, FormItem, FormControl, FormField, FormMessage, FormLabel, Input, Button } from '@repo/ui'
import { CURRENT_USER_KEY } from '../../hooks/use-current-user'
import { API_TOKEN_LOCAL_STORAGE_KEY } from '../../lib/constants'
import { client, queryClient } from '../../lib/client'
import { Logo } from '../../components/icons'

export const Route = createLazyFileRoute('/_auth/signup')({
  component: Signup,
})

function Signup() {
  const navigate = useNavigate()
  const loginMutation = client.auth.signup.useMutation({
    onSuccess: ({ body }) => {
      window.localStorage.setItem(API_TOKEN_LOCAL_STORAGE_KEY, body.token)
      queryClient.setQueryData(CURRENT_USER_KEY, { status: 200, body: body.user })
      navigate({ to: '/' })
    },
  })

  const form = useForm<z.infer<typeof contract.auth.signup.body>>({
    resolver: zodResolver(contract.auth.signup.body),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  })

  return (
    <div className="p-8 w-full max-w-md">
      <Logo className="w-12 h-12 mb-4 text-primary" />
      <div className="font-semibold text-2xl text-foreground mb-2">Create your account</div>
      <div className="text-muted-foreground text-sm mb-8">
        Already have an account?{' '}
        <Link to="/login" className="text-primary font-medium">
          Login here
        </Link>
      </div>
      <Form {...form}>
        <form
          className="space-y-6"
          onSubmit={form.handleSubmit(({ email, name, password }) => {
            loginMutation.mutate({ body: { name, email, password } })
          })}
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )
            }}
          />
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

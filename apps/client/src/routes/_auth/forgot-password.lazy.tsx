import { createLazyFileRoute } from '@tanstack/react-router'
import { Button, Form, FormControl, FormField, FormItem, FormLabel, FormMessage, Input } from '@repo/ui'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { contract } from '@repo/contract'
import { zodResolver } from '@hookform/resolvers/zod'
import { Logo } from '../../components/icons'

export const Route = createLazyFileRoute('/_auth/forgot-password')({
  component: ForgotPassword,
})

function ForgotPassword() {
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
      <div className="font-semibold text-2xl text-foreground mb-2">Recover your account</div>
      <div className="text-muted-foreground text-sm mb-8">Enter your recovery email</div>
      <Form {...form}>
        <form className="space-y-6" onSubmit={form.handleSubmit(() => {})}>
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
          <Button type="submit" className="w-full">
            Send Email
          </Button>
        </form>
      </Form>
    </div>
  )
}

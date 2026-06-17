import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import {
  CaptchaInput,
  type CaptchaInputRef,
} from '@/components/ui/captcha-input'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import { Logo } from '@/components/ui/logo'
import { authClient } from '@/lib/auth'
import { getErrorMessage } from '@/lib/utils'

const loginSchema = z.object({
  email: z.email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  captcha: z.string().min(6, 'Captcha required'),
})

const verifyTotpSchema = z.object({
  code: z
    .string()
    .min(6, 'Enter the 6-digit code')
    .max(6, 'Enter the 6-digit code')
    .regex(/^\d+$/, 'Enter the 6-digit code'),
  trustDevice: z.boolean(),
})

type LoginValues = z.infer<typeof loginSchema>
type VerifyTotpValues = z.infer<typeof verifyTotpSchema>
type TwoFactorMethod = 'totp' | 'otp'

export const Route = createFileRoute('/_auth/login')({
  component: Login,
  head: () => ({ meta: [{ title: 'Sign In | Fullstack Starter' }] }),
})

function Login() {
  const navigate = useNavigate()
  const [twoFactorMethods, setTwoFactorMethods] = useState<
    TwoFactorMethod[] | null
  >(null)

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

      if (
        result.data &&
        'twoFactorRedirect' in result.data &&
        result.data.twoFactorRedirect
      ) {
        const methods =
          'twoFactorMethods' in result.data &&
          Array.isArray(result.data.twoFactorMethods)
            ? (result.data.twoFactorMethods as TwoFactorMethod[])
            : (['totp'] as TwoFactorMethod[])

        return {
          twoFactorRedirect: true as const,
          twoFactorMethods: methods,
        }
      }

      return { twoFactorRedirect: false as const }
    },
    onSuccess: (data) => {
      if (data?.twoFactorRedirect) {
        setTwoFactorMethods(data.twoFactorMethods)
        return
      }

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
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-center gap-2">
        <Logo className="size-6" />
        <span className="font-medium">Fullstack Starter</span>
      </div>

      <Card>
        {twoFactorMethods ? (
          <TwoFactorLoginForm
            methods={twoFactorMethods}
            onBack={() => setTwoFactorMethods(null)}
          />
        ) : (
          <>
            <CardHeader className="text-center">
              <CardTitle className="text-xl font-semibold">
                Welcome back
              </CardTitle>
              <CardDescription>
                Enter your email and password to sign in
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Form {...form}>
                <form
                  className="grid gap-4"
                  onSubmit={form.handleSubmit((values) =>
                    loginMutation.mutate(values),
                  )}
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
                            placeholder="m@example.com"
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
                        <div className="flex items-center justify-between">
                          <FormLabel>Password</FormLabel>
                          <Link
                            to="/forgot-password"
                            className="text-sm underline-offset-4 hover:underline"
                          >
                            Forgot your password?
                          </Link>
                        </div>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="••••••••"
                            type="password"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="captcha"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Captcha</FormLabel>
                        <FormDescription>
                          Captcha is case sensitive
                        </FormDescription>
                        <FormControl>
                          <CaptchaInput
                            value={field.value}
                            onChange={field.onChange}
                            ref={captchaInputRef}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full"
                    loading={loginMutation.isPending}
                  >
                    Login
                  </Button>
                </form>
              </Form>
            </CardContent>

            <CardFooter className="justify-center border-t-0 bg-transparent pt-0">
              <p className="text-sm text-muted-foreground">
                Don&apos;t have an account?{' '}
                <Link
                  to="/signup"
                  className="text-foreground underline-offset-4 hover:underline"
                >
                  Sign up
                </Link>
              </p>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  )
}

type TwoFactorLoginFormProps = {
  methods: TwoFactorMethod[]
  onBack: () => void
}

function TwoFactorLoginForm({ methods, onBack }: TwoFactorLoginFormProps) {
  const navigate = useNavigate()
  const usesTotp = methods.includes('totp')

  const verifyForm = useForm<VerifyTotpValues>({
    resolver: zodResolver(verifyTotpSchema),
    defaultValues: {
      code: '',
      trustDevice: false,
    },
  })

  const verifyTotpMutation = useMutation({
    mutationFn: async ({ code, trustDevice }: VerifyTotpValues) => {
      const { data, error } = await authClient.twoFactor.verifyTotp({
        code,
        trustDevice,
      })

      if (error) {
        throw error
      }

      return data
    },
    onSuccess: () => {
      toast.success('Signed in')
      navigate({ to: '/', replace: true })
    },
    onError: (error) => {
      const errorMessage = getErrorMessage(error)
      toast.error('Unable to verify code', {
        description: errorMessage,
      })
      verifyForm.setError('code', { message: errorMessage })
      verifyForm.setValue('code', '')
    },
  })

  const handleVerifySubmit = (values: VerifyTotpValues) => {
    verifyTotpMutation.mutate(values)
  }

  return (
    <>
      <CardHeader className="text-center">
        <CardTitle className="text-xl font-semibold">
          Two-factor authentication
        </CardTitle>
        <CardDescription>
          {usesTotp
            ? 'Enter the 6-digit code from your authenticator app.'
            : 'Enter the verification code sent to your email.'}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...verifyForm}>
          <form
            className="grid gap-4"
            onSubmit={verifyForm.handleSubmit(handleVerifySubmit)}
          >
            <FormField
              control={verifyForm.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification code</FormLabel>
                  <FormControl>
                    <InputOTP
                      maxLength={6}
                      value={field.value}
                      onChange={field.onChange}
                      disabled={verifyTotpMutation.isPending}
                      autoFocus
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <FormDescription>
                    {usesTotp
                      ? 'Open your authenticator app to view your code.'
                      : 'Check your email for the verification code.'}
                  </FormDescription>
                  <FormMessage className="text-center" />
                </FormItem>
              )}
            />

            <FormField
              control={verifyForm.control}
              name="trustDevice"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start gap-3">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={verifyTotpMutation.isPending}
                    />
                  </FormControl>
                  <div className="flex flex-col gap-1">
                    <FormLabel className="font-normal">
                      Trust this device
                    </FormLabel>
                    <FormDescription>
                      Skip two-factor authentication on this device for 30 days.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              loading={verifyTotpMutation.isPending}
            >
              Verify and sign in
            </Button>
          </form>
        </Form>
      </CardContent>

      <CardFooter className="justify-center border-t-0 bg-transparent pt-0">
        <Button type="button" variant="link" onClick={onBack}>
          Back to sign in
        </Button>
      </CardFooter>
    </>
  )
}

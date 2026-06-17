import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { DownloadIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import QRCode from 'react-qr-code'
import { toast } from 'sonner'
import { match } from 'ts-pattern'
import * as z from 'zod'

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { BaseButton, Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ErrorMessage } from '@/components/ui/error-message'
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
import { Skeleton } from '@/components/ui/skeleton'
import { authClient } from '@/lib/auth'
import { cn, getErrorMessage, type WithBasicProps } from '@/lib/utils'

const twoFactorPasswordSchema = z.object({
  password: z.string().min(1, 'Password is required'),
})

const verifyTotpSchema = z.object({
  code: z
    .string()
    .min(6, 'Enter the 6-digit code')
    .max(6, 'Enter the 6-digit code')
    .regex(/^\d+$/, 'Enter the 6-digit code'),
})

type TwoFactorPasswordValues = z.infer<typeof twoFactorPasswordSchema>
type VerifyTotpValues = z.infer<typeof verifyTotpSchema>

const TWO_FACTOR_STATUS_QUERY_KEY = ['auth', 'two-factor-status'] as const

export default function TwoFactorAuthenticationForm() {
  const twoFactorStatusQuery = useQuery({
    queryKey: TWO_FACTOR_STATUS_QUERY_KEY,
    queryFn: async () => {
      const [sessionResult, accountsResult] = await Promise.all([
        authClient.getSession(),
        authClient.listAccounts(),
      ])

      if (sessionResult.error) {
        throw sessionResult.error
      }

      if (accountsResult.error) {
        throw accountsResult.error
      }

      if (!sessionResult.data?.user) {
        throw new Error('Session not found')
      }

      return {
        twoFactorEnabled: sessionResult.data.user.twoFactorEnabled ?? false,
        hasCredentialAccount: accountsResult.data.some(
          (account) => account.providerId === 'credential',
        ),
      }
    },
  })

  return match(twoFactorStatusQuery)
    .returnType<React.ReactNode>()
    .with({ status: 'pending' }, () => <TwoFactorAuthenticationFormSkeleton />)
    .with({ status: 'success' }, ({ data }) => {
      if (data.twoFactorEnabled) {
        return (
          <div className="flex flex-col gap-6">
            <TwoFactorEnabledCard />
            <GenerateBackupCodesCard />
          </div>
        )
      }

      return (
        <EnableTwoFactorForm hasCredentialAccount={data.hasCredentialAccount} />
      )
    })
    .with({ status: 'error' }, ({ error, refetch }) => (
      <ErrorMessage
        title="Unable to load two-factor authentication settings"
        error={error}
        onReset={() => void refetch()}
        showBackHomeLink={false}
      />
    ))
    .otherwise(() => null)
}

type EnableTwoFactorFormProps = {
  hasCredentialAccount: boolean
}

function EnableTwoFactorForm({
  hasCredentialAccount,
}: EnableTwoFactorFormProps) {
  const passwordForm = useForm<TwoFactorPasswordValues>({
    resolver: zodResolver(twoFactorPasswordSchema),
    defaultValues: {
      password: '',
    },
  })

  const enableTwoFactorMutation = useMutation({
    mutationFn: async ({ password }: TwoFactorPasswordValues) => {
      const { data, error } = await authClient.twoFactor.enable({ password })

      if (error) {
        throw error
      }

      if (!data) {
        throw new Error('Failed to enable two-factor authentication')
      }

      return data
    },
  })

  const handlePasswordSubmit = (values: TwoFactorPasswordValues) => {
    void toast
      .promise(enableTwoFactorMutation.mutateAsync(values), {
        loading: 'Preparing authenticator setup...',
        success: 'Scan the QR code with your authenticator app',
        error: (error) => ({
          message: 'Unable to enable two-factor authentication',
          description: getErrorMessage(error),
        }),
      })
      .unwrap()
      .catch((error: unknown) => {
        passwordForm.setError('password', {
          message: getErrorMessage(error),
        })
      })
  }

  return match(enableTwoFactorMutation)
    .returnType<React.ReactNode>()
    .with({ status: 'success' }, ({ data }) => (
      <EnableTwoFactorVerifyStep
        backupCodes={data.backupCodes}
        totpURI={data.totpURI}
      />
    ))
    .otherwise(() => (
      <EnableTwoFactorPasswordStep
        formDisabled={!hasCredentialAccount}
        hasCredentialAccount={hasCredentialAccount}
        isPending={enableTwoFactorMutation.isPending}
        onSubmit={handlePasswordSubmit}
        passwordForm={passwordForm}
      />
    ))
}

type EnableTwoFactorPasswordStepProps = {
  formDisabled: boolean
  hasCredentialAccount: boolean
  isPending: boolean
  onSubmit: (values: TwoFactorPasswordValues) => void
  passwordForm: ReturnType<typeof useForm<TwoFactorPasswordValues>>
}

function EnableTwoFactorPasswordStep({
  formDisabled,
  hasCredentialAccount,
  isPending,
  onSubmit,
  passwordForm,
}: EnableTwoFactorPasswordStepProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Two-factor authentication (TOTP)</CardTitle>
        <CardDescription>
          Add an authenticator app to require a TOTP code at sign in.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {!hasCredentialAccount ? (
          <p className="text-muted-foreground text-sm/relaxed">
            Two-factor authentication setup is unavailable because your account
            has no email and password credential. If you sign in with Google or
            another provider, continue using that to access your account.
          </p>
        ) : null}

        <Form {...passwordForm}>
          <form
            className="flex flex-col gap-4"
            onSubmit={passwordForm.handleSubmit(onSubmit)}
          >
            <FormField
              control={passwordForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm with your password</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      placeholder="••••••••"
                      autoComplete="current-password"
                      disabled={formDisabled || isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <Button type="submit" loading={isPending} disabled={formDisabled}>
                Enable two-factor authentication
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

type EnableTwoFactorVerifyStepProps = {
  backupCodes: string[]
  totpURI: string
}

function EnableTwoFactorVerifyStep({
  backupCodes,
  totpURI,
}: EnableTwoFactorVerifyStepProps) {
  const queryClient = useQueryClient()

  const verifyForm = useForm<VerifyTotpValues>({
    resolver: zodResolver(verifyTotpSchema),
    defaultValues: {
      code: '',
    },
  })

  const verifyTotpMutation = useMutation({
    mutationFn: async ({ code }: VerifyTotpValues) => {
      const { data, error } = await authClient.twoFactor.verifyTotp({
        code,
        trustDevice: true,
      })

      if (error) {
        throw error
      }

      return data
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: TWO_FACTOR_STATUS_QUERY_KEY,
      })
    },
  })

  const handleVerifySubmit = (values: VerifyTotpValues) => {
    void toast
      .promise(verifyTotpMutation.mutateAsync(values), {
        loading: 'Verifying code...',
        success: 'Two-factor authentication enabled',
        error: (error) => ({
          message: 'Unable to verify code',
          description: getErrorMessage(error),
        }),
      })
      .unwrap()
      .catch((error: unknown) => {
        verifyForm.setError('code', {
          message: getErrorMessage(error),
        })
      })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Two-factor authentication (TOTP)</CardTitle>
        <CardDescription>
          Scan the QR code with your authenticator app, then enter the 6-digit
          code to finish setup.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <p className="text-muted-foreground text-sm/relaxed">
            Open your authenticator app and scan this QR code, or enter the
            setup key manually in the app.
          </p>
          <div className="w-fit rounded-lg bg-white p-4">
            <QRCode value={totpURI} />
          </div>
        </div>

        <BackupCodes codes={backupCodes} />

        <Form {...verifyForm}>
          <form
            className="flex flex-col gap-4"
            onSubmit={verifyForm.handleSubmit(handleVerifySubmit)}
          >
            <FormField
              control={verifyForm.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Authenticator code</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      placeholder="000000"
                      maxLength={6}
                      disabled={verifyTotpMutation.isPending}
                      onChange={(event) => {
                        field.onChange(
                          event.target.value.replace(/\D/g, '').slice(0, 6),
                        )
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter the 6-digit code from your authenticator app.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <Button type="submit" loading={verifyTotpMutation.isPending}>
                Verify and enable
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

function TwoFactorEnabledCard() {
  const queryClient = useQueryClient()
  const [disableDialogOpen, setDisableDialogOpen] = useState(false)

  const disableForm = useForm<TwoFactorPasswordValues>({
    resolver: zodResolver(twoFactorPasswordSchema),
    defaultValues: {
      password: '',
    },
  })

  const disableTwoFactorMutation = useMutation({
    mutationFn: async ({ password }: TwoFactorPasswordValues) => {
      const { data, error } = await authClient.twoFactor.disable({ password })

      if (error) {
        throw error
      }

      return data
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: TWO_FACTOR_STATUS_QUERY_KEY,
      })
    },
  })

  const handleDisableDialogOpenChange = (open: boolean) => {
    setDisableDialogOpen(open)

    if (!open) {
      disableForm.reset()
      disableForm.clearErrors()
    }
  }

  const handleDisableSubmit = (values: TwoFactorPasswordValues) => {
    void toast
      .promise(disableTwoFactorMutation.mutateAsync(values), {
        loading: 'Disabling two-factor authentication...',
        success: 'Two-factor authentication disabled',
        error: (error) => ({
          message: 'Unable to disable two-factor authentication',
          description: getErrorMessage(error),
        }),
      })
      .unwrap()
      .then(() => {
        handleDisableDialogOpenChange(false)
      })
      .catch((error: unknown) => {
        disableForm.setError('password', {
          message: getErrorMessage(error),
        })
      })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Two-factor authentication (TOTP)</CardTitle>
        <CardDescription>
          Your account requires a TOTP code from your authenticator app when you
          sign in.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <p className="text-muted-foreground text-sm/relaxed">
          Two-factor authentication is enabled for your account.
        </p>

        <AlertDialog
          open={disableDialogOpen}
          onOpenChange={handleDisableDialogOpenChange}
        >
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-min">
              Disable two-factor authentication
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Disable two-factor authentication?
              </AlertDialogTitle>
              <AlertDialogDescription>
                You will only need your password to sign in. Confirm with your
                password to turn off two-factor authentication.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <Form {...disableForm}>
              <form
                className="flex flex-col gap-4"
                onSubmit={disableForm.handleSubmit(handleDisableSubmit)}
              >
                <FormField
                  control={disableForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm with your password</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder="••••••••"
                          autoComplete="current-password"
                          disabled={disableTwoFactorMutation.isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <AlertDialogFooter>
                  <AlertDialogCancel
                    disabled={disableTwoFactorMutation.isPending}
                  >
                    Cancel
                  </AlertDialogCancel>
                  <Button
                    type="submit"
                    variant="destructive"
                    loading={disableTwoFactorMutation.isPending}
                  >
                    Disable two-factor authentication
                  </Button>
                </AlertDialogFooter>
              </form>
            </Form>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  )
}

type BackupCodesProps = WithBasicProps<{
  codes: string[]
}>

function BackupCodes({ codes, className, style }: BackupCodesProps) {
  const downloadHref = useMemo(
    () =>
      `data:text/plain;charset=utf-8,${encodeURIComponent(codes.join('\n'))}`,
    [codes],
  )

  return (
    <div className={cn('flex flex-col gap-3', className)} style={style}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium">Backup codes</p>
        <BaseButton variant="outline" size="icon" asChild>
          <a
            href={downloadHref}
            download="two-factor-backup-codes.txt"
            aria-label="Download backup codes"
          >
            <DownloadIcon />
          </a>
        </BaseButton>
      </div>
      <p className="text-muted-foreground text-sm/relaxed">
        Save these backup codes in a secure place. Each code can be used once if
        you lose access to your authenticator app.
      </p>
      <ul className="grid gap-2 sm:grid-cols-2">
        {codes.map((code) => (
          <li
            key={code}
            className="bg-muted rounded-md px-3 py-2 font-mono text-sm"
          >
            {code}
          </li>
        ))}
      </ul>
    </div>
  )
}

function GenerateBackupCodesCard() {
  const passwordForm = useForm<TwoFactorPasswordValues>({
    resolver: zodResolver(twoFactorPasswordSchema),
    defaultValues: {
      password: '',
    },
  })

  const generateBackupCodesMutation = useMutation({
    mutationFn: async ({ password }: TwoFactorPasswordValues) => {
      const { data, error } = await authClient.twoFactor.generateBackupCodes({
        password,
      })

      if (error) {
        throw error
      }

      if (!data) {
        throw new Error('Failed to generate backup codes')
      }

      return data
    },
  })

  const handleGenerateSubmit = (values: TwoFactorPasswordValues) => {
    void toast
      .promise(generateBackupCodesMutation.mutateAsync(values), {
        loading: 'Generating backup codes...',
        success: 'New backup codes generated',
        error: (error) => ({
          message: 'Unable to generate backup codes',
          description: getErrorMessage(error),
        }),
      })
      .unwrap()
      .then(() => {
        passwordForm.reset()
      })
      .catch((error: unknown) => {
        passwordForm.setError('password', {
          message: getErrorMessage(error),
        })
      })
  }

  return match(generateBackupCodesMutation)
    .returnType<React.ReactNode>()
    .with({ status: 'success' }, ({ data }) => (
      <Card>
        <CardHeader>
          <CardTitle>Backup codes</CardTitle>
          <CardDescription>
            Store these codes in a secure place. Each code works once if you
            lose access to your authenticator app.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <BackupCodes codes={data.backupCodes} />
        </CardContent>
      </Card>
    ))
    .otherwise(() => (
      <Card>
        <CardHeader>
          <CardTitle>Backup codes</CardTitle>
          <CardDescription>
            Generate new backup codes for account recovery. This invalidates any
            previously generated backup codes.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <Form {...passwordForm}>
            <form
              className="flex flex-col gap-4"
              onSubmit={passwordForm.handleSubmit(handleGenerateSubmit)}
            >
              <FormField
                control={passwordForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm with your password</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="••••••••"
                        autoComplete="current-password"
                        disabled={generateBackupCodesMutation.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <Button
                  type="submit"
                  loading={generateBackupCodesMutation.isPending}
                >
                  Generate backup codes
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    ))
}

function TwoFactorAuthenticationFormSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-64" />
        <Skeleton className="h-4 w-full max-w-md" />
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <div className="grid gap-1">
            <Skeleton className="h-4 w-44" />
            <Skeleton className="h-8 w-full" />
          </div>
          <Skeleton className="h-8 w-56" />
        </div>
      </CardContent>
    </Card>
  )
}

import { useQuery } from '@tanstack/react-query'
import { RefreshCwIcon, TriangleAlertIcon } from 'lucide-react'
import { forwardRef, useId, useImperativeHandle } from 'react'
import { match } from 'ts-pattern'

import { Button } from './button'
import { Input } from './input'
import { Skeleton } from './skeleton'

import { honoClient } from '@/lib/hono'
import { getErrorMessage, type WithBasicProps } from '@/lib/utils'

type CaptchaInputProps = WithBasicProps<{
  value?: string
  onChange?: React.ComponentProps<'input'>['onChange']
}>

export type CaptchaInputRef = {
  refetchCaptcha: () => void
  getProblem: () => string
}

export const CaptchaInput = forwardRef<CaptchaInputRef, CaptchaInputProps>(
  ({ value, onChange, className, style }, ref) => {
    const id = useId()

    const captchaQuery = useQuery({
      queryKey: ['captcha', id],
      queryFn: async () => {
        const res = await honoClient.api.captcha.$get({ query: {} })
        const problem = res.headers.get('X-Captcha-Problem')
        if (!problem) {
          throw new Error('Invalid captcha')
        }
        return { url: URL.createObjectURL(await res.blob()), problem }
      },
    })

    useImperativeHandle(ref, () => ({
      refetchCaptcha: () => {
        captchaQuery.refetch()
      },
      getProblem: () => {
        if (captchaQuery.status !== 'success') {
          throw new Error('Captcha not yet loaded')
        }
        return captchaQuery.data.problem
      },
    }))

    return (
      <div className={className} style={style}>
        {match(captchaQuery)
          .returnType<React.ReactNode>()
          .with({ status: 'pending' }, () => {
            return (
              <div className="space-y-2">
                <Skeleton className="w-full h-[90px]"></Skeleton>
                <Skeleton className="w-full h-8" />
              </div>
            )
          })
          .with({ status: 'success' }, ({ data }) => {
            return (
              <div className="space-y-2">
                <img
                  src={data.url}
                  className="border rounded-md overflow-hidden w-full object-contain h-20 bg-muted/20 shadow-inner"
                />
                <div className="flex items-center gap-2">
                  <Input
                    value={value || ''}
                    onChange={onChange}
                    placeholder="Captcha"
                    className="flex-1"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    icon={<RefreshCwIcon />}
                    type="button"
                    onClick={() => {
                      captchaQuery.refetch()
                    }}
                  />
                </div>
              </div>
            )
          })
          .with({ status: 'error' }, ({ error }) => {
            return (
              <div className="rounded-md border flex flex-col items-center justify-center p-3">
                <TriangleAlertIcon className="size-5 mb-2" />
                <div className="text-sm text-destructive">
                  Error loading captcha
                </div>
                <div className="text-xs text-muted-foreground">
                  {getErrorMessage(error)}
                </div>
              </div>
            )
          })
          .otherwise(() => null)}
      </div>
    )
  },
)
CaptchaInput.displayName = 'CaptchaInput'

import { BaseValidationSchema, FormConfig } from '@repo/contract'
import { useMemo, useRef } from 'react'
import { z } from 'zod'
import { cn } from '../../lib/utils'
import { FileUploader } from '../ui/file-uploader'
import SubformsPreview from './components/subforms-preview'
import { DownloadDetails } from './components/download-details'

export type FormPreviewExtraFieldProps = {
  fileUploader?: {
    getPreviewUrl?: React.ComponentProps<typeof FileUploader>['getPreviewUrl']
  }
}

type FormPreviewProps<ValidationSchema extends BaseValidationSchema, SubformKey extends string> = {
  className?: string
  style?: React.CSSProperties
  config: FormConfig<ValidationSchema, SubformKey>
  formData: z.infer<ValidationSchema>
  extraFieldProps?: FormPreviewExtraFieldProps
  classNames?: {
    stepperInfo?: string
  }
  extraActions?: () => React.ReactNode
}

export function FormPreview<ValidationSchema extends BaseValidationSchema, SubformKey extends string>({
  config,
  formData,
  extraFieldProps,
  extraActions,
  classNames,
  className,
  style,
}: FormPreviewProps<ValidationSchema, SubformKey>) {
  const detailsContainer = useRef<HTMLDivElement>(null)

  const stepsToRender = useMemo(
    () =>
      (config.formConfig.steps ?? []).filter((step) => {
        const hidden = typeof step.hidden === 'function' ? step.hidden(formData) : step.hidden
        return !hidden
      }),
    [config, formData],
  )

  const subformsToRender = useMemo(
    () =>
      config.formConfig.subforms.filter((subform) => {
        const hidden = typeof subform.hidden === 'function' ? subform.hidden(formData) : subform.hidden
        return !hidden
      }),
    [config.formConfig.subforms, formData],
  )

  const isStepper = stepsToRender.length > 1

  return (
    <div className={cn('space-y-8', className)} style={style}>
      <div className="space-y-8 print:space-y-4" ref={detailsContainer}>
        {isStepper ? (
          stepsToRender.map((step) => {
            const subforms = subformsToRender.filter((subform) => step.subforms.includes(subform.id))

            return (
              <div key={step.id} className="grid grid-cols-3 gap-8 items-start print:grid-cols-2 print:gap-2">
                <div className={cn(classNames?.stepperInfo, 'lg:col-span-1 col-span-full')}>
                  <div className="font-medium">{step.name.en}</div>
                  {step.description?.en ? (
                    <div className="text-sm text-muted-foreground">{step.description?.en}</div>
                  ) : null}
                </div>

                <div className="space-y-4 lg:col-span-2 col-span-full">
                  <SubformsPreview subforms={subforms} formData={formData} extraFieldProps={extraFieldProps} />
                </div>
              </div>
            )
          })
        ) : (
          <SubformsPreview subforms={subformsToRender} formData={formData} extraFieldProps={extraFieldProps} />
        )}
      </div>
      <div className="flex gap-x-4 justify-end">
        {extraActions?.()}
        <DownloadDetails detailsContainerRef={detailsContainer} />
      </div>
    </div>
  )
}

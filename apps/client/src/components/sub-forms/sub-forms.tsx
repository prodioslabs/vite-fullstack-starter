import { useMemo } from 'react'
import { useFormContext } from 'react-hook-form'
import { FormField, cn } from '@repo/ui'
import { SubformConfig } from '../../types/service'
import Field from '../field'

type SubFormsProps = {
  className?: string
  style?: React.CSSProperties
  subforms: Array<SubformConfig>
}

export default function SubForms({ className, style, subforms }: SubFormsProps) {
  const { control, watch } = useFormContext()
  const values = watch()

  const subformsToRender = useMemo(() => {
    return subforms.filter((subform) => {
      const isHidden = typeof subform.hidden === 'function' ? subform.hidden(values) : Boolean(subform.hidden)
      return !isHidden
    })
  }, [subforms, values])

  return (
    <div className={className} style={style}>
      {subformsToRender.map((subform) => (
        <div className={cn('overflow-hidden rounded-md border shadow-sm', className)} style={style} key={subform.id}>
          <div>
            <div className="bg-primary px-4 py-2">
              <h1 className="text-xl font-medium text-white">{subform.name}</h1>
              {!!subform.description && <p className="text-xs text-muted">{subform.description}</p>}
            </div>

            <div className="grid gap-4 p-4 md:grid-cols-2">
              {subform.fields.map((field) => (
                <FormField key={field.id} control={control} name={field.id} render={() => <Field field={field} />} />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

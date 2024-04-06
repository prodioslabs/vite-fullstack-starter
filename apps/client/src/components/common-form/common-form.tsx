import { useForm } from 'react-hook-form'
import { Form } from '@repo/ui'
import { zodResolver } from '@hookform/resolvers/zod'
import { CommonFormConfig } from '../../types/service'
import { getValidationSchemaFromConfig } from '../../lib/validation-schema'
import SubForms from '../sub-forms'

type CommonFormProps = {
  className?: string
  style?: React.CSSProperties
  formConfig: CommonFormConfig
}

export default function CommonForm({ className, style, formConfig }: CommonFormProps) {
  const form = useForm({
    resolver: zodResolver(formConfig.validationSchema ?? getValidationSchemaFromConfig(formConfig)),
    defaultValues: formConfig.initialValues,
    mode: 'all',
  })

  return (
    <Form {...form}>
      <form className={className} style={style}>
        <SubForms subforms={formConfig.subforms} />
        <div className="my-4">
          {Object.keys(form.formState.errors).length > 0 ? (
            <div className="p-2 rounded-md bg-red-50 text-red-400 border-[1px] border-red-400">
              <p className="font-semibold">Please rectify errors in following fields</p>
              <p className="text-sm truncate">{Object.keys(form.formState.errors).join(', ')}</p>
            </div>
          ) : null}
        </div>
      </form>
    </Form>
  )
}

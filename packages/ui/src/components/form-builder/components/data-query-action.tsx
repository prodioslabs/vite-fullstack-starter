import { useMutation } from '@tanstack/react-query'
import { DataQueryActionField, FormRef } from '@repo/contract'
import { Button } from '../../ui/button'

type DataQueryActionProps = {
  field: DataQueryActionField<any>
  formRef: FormRef<any>
  className?: string
  style?: React.CSSProperties
}

export default function DataQueryAction({ field, formRef, className, style }: DataQueryActionProps) {
  const query = useMutation({
    mutationFn: field.queryFn,
    onSuccess: (data) => {
      field.onQuerySuccess?.(formRef, data)
    },
    onError: (error) => {
      field.onQueryError?.(formRef, error)
    },
  })

  return (
    <Button
      type="button"
      loading={query.isPending}
      onClick={() => {
        query.mutate(formRef.getData())
      }}
      className={className}
      style={style}
    >
      {field.label.en}
    </Button>
  )
}

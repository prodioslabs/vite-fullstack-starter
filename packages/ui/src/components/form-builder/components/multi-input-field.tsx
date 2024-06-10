import { useFieldArray, useFormContext } from 'react-hook-form'
import { forwardRef } from 'react'
import { PlusIcon, TrashIcon } from 'lucide-react'
import { generateDummyData } from '@repo/contract'
import { cn } from '../../../lib/utils'
import { Button } from '../../ui/button'
import SingleInputField from './single-input-field'
import SortableList from '../../sortable-list'
import { InputFieldProps } from './field.props'

const MultiInputField = forwardRef<React.ElementRef<'div'>, InputFieldProps>(
  ({ field, control, renderInput, className, style }, ref) => {
    const fieldName = String(field.id)
    const { fields, append, remove, swap } = useFieldArray({ name: fieldName, control })

    const { getFieldState, formState } = useFormContext()
    const errorMessage =
      getFieldState(fieldName, formState)?.error?.message ??
      getFieldState(`${fieldName}.root`, formState)?.error?.message

    return (
      <div className={cn('space-y-2', className)} ref={ref}>
        <SortableList
          className="space-y-4"
          style={style}
          items={fields.map((field) => ({ id: field.id, data: field }))}
          onDragEnd={({ active, over }) => {
            const fromIndex = fields?.findIndex((item) => item.id === active.id)
            const toIndex = fields?.findIndex((item) => item.id === over!.id)
            if (typeof fromIndex !== 'undefined' && typeof toIndex !== 'undefined') {
              swap(fromIndex, toIndex)
            }
          }}
          renderItem={({ id }, index) => {
            return (
              <SortableList.Item key={id} id={id} className="flex items-start space-x-2 bg-background">
                <SortableList.DragHandle />
                <SingleInputField
                  className="flex-1"
                  field={{
                    ...field,
                    id: `${fieldName}.${index}`,
                  }}
                  control={control}
                  renderInput={renderInput}
                />
                <div className="h-8 border-r border-dashed" />
                <Button
                  type="button"
                  icon={<TrashIcon />}
                  variant="destructive-outline"
                  size="icon-sm"
                  className="opacity-30 hover:opacity-100"
                  onClick={() => {
                    remove(index)
                  }}
                />
              </SortableList.Item>
            )
          }}
        />
        <div className="flex items-center">
          <Button
            type="button"
            variant="outline"
            icon={<PlusIcon />}
            onClick={() => {
              append(generateDummyData(field))
            }}
            size="sm"
          >
            Add Entry
          </Button>
        </div>
        {errorMessage ? <div className="text-xs font-medium text-destructive">{errorMessage}</div> : null}
      </div>
    )
  },
)

export default MultiInputField

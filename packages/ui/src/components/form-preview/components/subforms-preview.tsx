import { FieldConfig, option, SubformConfig, BaseValidationSchema, file } from '@repo/contract'
import { Fragment, useCallback } from 'react'
import invariant from 'tiny-invariant'
import { match, P } from 'ts-pattern'
import { z } from 'zod'
import { FileTextIcon } from 'lucide-react'
import { get } from 'lodash'
import { FilePreview } from '../../ui/file-preview'
import { FormPreviewExtraFieldProps } from '../form-preview'
import { cn } from '../../../lib/utils'

type SubformPreviewProps<ValidationSchema extends BaseValidationSchema, SubformKey extends string> = {
  className?: string
  style?: React.CSSProperties
  formData: z.infer<ValidationSchema>
  subforms: SubformConfig<ValidationSchema, SubformKey>[]
  extraFieldProps?: FormPreviewExtraFieldProps
}

export default function SubformsPreview<ValidationSchema extends BaseValidationSchema, SubformKey extends string>({
  className,
  style,
  formData,
  subforms,
  extraFieldProps,
}: SubformPreviewProps<ValidationSchema, SubformKey>) {
  const renderValueForField = useCallback(
    (field: FieldConfig<ValidationSchema>, parentFieldId?: FieldConfig<ValidationSchema>['id']) => {
      const fieldId = parentFieldId ? `${String(parentFieldId)}.${String(field.id)}` : field.id

      const fieldValue = get(formData, fieldId)

      return match(field)
        .returnType<React.ReactNode>()
        .with({ type: 'string' }, (stringField) =>
          match(stringField)
            .with({ inputType: 'password' }, () => '******')
            .otherwise(() => {
              if (stringField.multiple && Array.isArray(fieldValue)) {
                return fieldValue.join(', ')
              }

              return fieldValue
            }),
        )
        .with({ type: 'file' }, (fileField) => {
          invariant(typeof extraFieldProps?.fileUploader?.getPreviewUrl === 'function', 'getPreviewUrl is not provided')

          if (fileField.multiple) {
            const parsedFiles = z.array(file).safeParse(fieldValue)
            if (!parsedFiles.success) {
              return <div className="text-destructive">Error: received malformed data</div>
            }

            return (
              <div className="space-y-2">
                {parsedFiles.data.map((file, i) => {
                  const fileUrl = extraFieldProps.fileUploader?.getPreviewUrl?.(file)
                  if (!fileUrl) {
                    return null
                  }
                  return <FilePreview key={i} file={fileUrl} mimeType={file.mimeType} />
                })}
              </div>
            )
          }

          const fileUrl = extraFieldProps.fileUploader.getPreviewUrl(fieldValue)

          return <FilePreview file={fileUrl} mimeType={fieldValue.mimeType} />
        })
        .with({ type: P.union('radio', 'select') }, (field) => {
          if (field.multiple) {
            const parsedOptions = z.array(option).safeParse(fieldValue)
            if (!parsedOptions.success) {
              return <div className="text-destructive">Error: received malformed data</div>
            }

            return (
              <div className="space-y-2">
                {parsedOptions.data.map((option) => (
                  <div key={option.value} className="space-y-0.5">
                    <div className="font-medium text-foreground">{option.label.en}</div>
                    {option?.description?.en ? (
                      <div className="text-muted-foreground text-sm font-normal">{option.description.en}</div>
                    ) : null}
                  </div>
                ))}
              </div>
            )
          }

          const parsedOption = option.safeParse(fieldValue)
          if (!parsedOption.success) {
            return <div className="text-destructive">Error: received malformed data</div>
          }

          return (
            <div className="space-y-0.5">
              <div className="font-medium text-foreground">{parsedOption.data.label.en}</div>
              {parsedOption.data?.description?.en ? (
                <div className="text-muted-foreground text-sm font-normal">{parsedOption.data.description.en}</div>
              ) : null}
            </div>
          )
        })
        .with({ type: 'multi-checkbox' }, (multiCheckboxField) => {
          if (multiCheckboxField.multiple) {
            const parsedOptions = z.array(z.array(option)).safeParse(fieldValue)
            if (!parsedOptions.success) {
              return <div className="text-destructive">Error: received malformed data</div>
            }

            return (
              <div className="space-y-2">
                {parsedOptions.data.map((parsedOption, i) => (
                  <div key={i} className="flex flex-col gap-4">
                    {parsedOption.map((option) => (
                      <div key={option.value} className="space-y-0.5">
                        <div className="font-medium text-foreground">{option.label.en}</div>
                        {option.description ? (
                          <div className="text-muted-foreground text-sm font-normal">{option.description.en}</div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )
          }

          const parsedOptions = z.array(option).safeParse(fieldValue)
          if (!parsedOptions.success) {
            return <div className="text-destructive">Error: received malformed data</div>
          }

          return (
            <div className="flex flex-col gap-4">
              {parsedOptions.data.map((option) => (
                <div key={option.value} className="space-y-0.5">
                  <div className="font-medium text-foreground">{option.label.en}</div>
                  {option.description ? (
                    <div className="text-muted-foreground text-sm font-normal">{option.description.en}</div>
                  ) : null}
                </div>
              ))}
            </div>
          )
        })
        .with({ type: 'date' }, (dateField) => {
          if (dateField.multiple) {
            const parsedDates = z.array(z.string().datetime()).safeParse(fieldValue)
            if (!parsedDates.success) {
              return <div className="text-destructive">Error: received malformed data</div>
            }

            return (
              <div className="space-y-2">
                {parsedDates.data.map((date, i) => (
                  <div key={i}>{date}</div>
                ))}
              </div>
            )
          }

          return fieldValue
        })
        .with({ type: 'number' }, (numberField) => {
          if (numberField.multiple) {
            const parsedNumbers = z.array(z.number()).safeParse(fieldValue)
            if (!parsedNumbers.success) {
              return <div className="text-destructive">Error: received malformed data</div>
            }

            return (
              <div className="space-y-2">
                {parsedNumbers.data.map((value, i) => (
                  <div key={i}>{value}</div>
                ))}
              </div>
            )
          }

          return fieldValue
        })
        .with({ type: 'checkbox' }, (checkboxField) => {
          if (checkboxField.multiple) {
            const parsedCheckboxes = z.array(z.boolean()).safeParse(fieldValue)
            if (!parsedCheckboxes.success) {
              return <div className="text-destructive">Error: received malformed data</div>
            }

            return (
              <div className="space-y-2">
                {parsedCheckboxes.data.map((checked, i) => (
                  <div key={i}>{checked ? 'Yes' : 'No'}</div>
                ))}
              </div>
            )
          }

          return fieldValue ? 'Yes' : 'No'
        })
        .with({ type: 'object' }, (objectField) => {
          if (objectField.multiple && Array.isArray(fieldValue)) {
            return (
              <div className="grid grid-cols-1 gap-2">
                {fieldValue.map((_: unknown, index: number) => (
                  <ObjectFieldPreview
                    key={index}
                    formData={formData}
                    objectField={{
                      ...objectField,
                      id: `${String(objectField.id)}.${index}`,
                    }}
                    renderFieldValue={(field, parentId) => renderValueForField(field, parentId)}
                  />
                ))}
              </div>
            )
          }

          return (
            <ObjectFieldPreview
              formData={formData}
              objectField={objectField}
              renderFieldValue={(field, parentId) => renderValueForField(field, parentId)}
            />
          )
        })
        .otherwise(() => 'N/A')
    },
    [extraFieldProps, formData],
  )

  return subforms.map((subform) => (
    <div key={subform.id} className={cn('border rounded-md', className)} style={style}>
      <div className="border-b py-3 px-4 flex items-center gap-4">
        <div className="bg-primary/10 text-primary border border-primary/20 p-2 rounded-md">
          <FileTextIcon className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <div className="text-base font-semibold">{subform.name.en}</div>
          {subform.description?.en ? (
            <div className="text-muted-foreground text-sm">{subform.description.en}</div>
          ) : null}
        </div>
      </div>

      <div className="p-4 grid grid-cols-3 gap-4 items-start text-sm">
        {subform.fields.map((field, index) => {
          const isHidden = typeof field.hidden === 'function' ? field.hidden(formData) : field.hidden

          if (isHidden) {
            return null
          }

          return (
            <Fragment key={index}>
              <div className="md:col-span-1 col-span-full">
                <div className="">{field.name.en}</div>
                {field.description?.en ? (
                  <div className="text-sm text-muted-foreground">{field.description.en}</div>
                ) : null}
              </div>
              <div className="md:col-span-2 col-span-full text-muted-foreground">
                {!formData[field.id] ? 'N/A' : renderValueForField(field)}
              </div>
            </Fragment>
          )
        })}
      </div>
    </div>
  ))
}

type ObjectFieldPreviewProps<ValidationSchema extends BaseValidationSchema> = {
  objectField: FieldConfig<ValidationSchema>
  formData: z.infer<ValidationSchema>
  renderFieldValue?: (
    field: FieldConfig<ValidationSchema>,
    parentId?: FieldConfig<ValidationSchema>['id'],
  ) => React.ReactNode
}

function ObjectFieldPreview<ValidationSchema extends BaseValidationSchema>({
  objectField,
  formData,
  renderFieldValue,
}: ObjectFieldPreviewProps<ValidationSchema>) {
  if (objectField.type !== 'object') {
    return <div className="text-destructive">Error: received malformed data</div>
  }

  const fields = objectField.fields

  return (
    <div className="gap-2 border rounded-md px-4 py-2 grid grid-cols-3 items-start mb-2">
      {fields.map((nestedField) => (
        <Fragment key={String(nestedField.id)}>
          <div className="col-span-1">
            <div className="font-medium text-foreground">{nestedField.name.en}</div>
            {nestedField.description?.en ? (
              <div className="text-sm text-muted-foreground">{nestedField.description.en}</div>
            ) : null}
          </div>

          <div className="col-span-2 text-muted-foreground">
            {nestedField.type === 'object' ? (
              <ObjectFieldPreview
                objectField={nestedField as FieldConfig<ValidationSchema>}
                formData={formData}
                renderFieldValue={(field) =>
                  renderFieldValue &&
                  renderFieldValue(
                    field as FieldConfig<ValidationSchema>,
                    `${String(objectField.id)}.${String(nestedField.id)}`,
                  )
                }
              />
            ) : typeof renderFieldValue === 'function' ? (
              renderFieldValue(nestedField as FieldConfig<ValidationSchema>, objectField.id)
            ) : (
              'N/A'
            )}
          </div>
        </Fragment>
      ))}
    </div>
  )
}

import { Control, Controller } from 'react-hook-form'
import { FieldConfig } from '@repo/contract'

type RenderArgs = Parameters<React.ComponentProps<typeof Controller>['render']>[0] & { fieldName: string }
type RenderOutput = ReturnType<React.ComponentProps<typeof Controller>['render']>
type RenderInput = (args: RenderArgs) => RenderOutput

export type InputFieldProps = {
  field: FieldConfig<any>
  control: Control
  renderInput: RenderInput
  className?: string
  style?: React.CSSProperties
}

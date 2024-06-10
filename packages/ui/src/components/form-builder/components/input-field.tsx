import MultiInputField from './multi-input-field'
import SingleInputField from './single-input-field'
import { InputFieldProps } from './field.props'

export default function InputField(props: InputFieldProps) {
  if (props.field.multiple) {
    return <MultiInputField {...props} />
  }
  return <SingleInputField {...props} />
}

import { useContext } from 'react'
import { GripIcon } from 'lucide-react'
import { SortableItemContext } from '../context'
import { cn } from '../../../lib/utils'
import { Button } from '../../ui/button'

type DragHandleProps = {
  className?: string
  style?: React.CSSProperties
}

export default function DragHandle({ className, style }: DragHandleProps) {
  const { attributes, listeners, ref } = useContext(SortableItemContext)

  return (
    <Button
      icon={<GripIcon />}
      {...attributes}
      {...listeners}
      ref={ref}
      type="button"
      variant="ghost"
      size="icon-sm"
      className={cn('cursor-grab', className)}
      style={style}
    />
  )
}

import { useMemo } from 'react'
import type { UniqueIdentifier } from '@dnd-kit/core'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { SortableItemContext } from '../context'

interface Props {
  id: UniqueIdentifier
  className?: string
  style?: React.CSSProperties
}

export default function SortableItem({ children, id, className, style = {} }: React.PropsWithChildren<Props>) {
  const { attributes, isDragging, listeners, setNodeRef, setActivatorNodeRef, transform, transition } = useSortable({
    id,
  })
  const context = useMemo(
    () => ({
      attributes,
      listeners,
      ref: setActivatorNodeRef,
    }),
    [attributes, listeners, setActivatorNodeRef],
  )

  const dragStyle: React.CSSProperties = {
    opacity: isDragging ? 0.4 : undefined,
    transform: CSS.Translate.toString(transform),
    transition,
  }

  return (
    <SortableItemContext.Provider value={context}>
      <div ref={setNodeRef} style={{ ...style, ...dragStyle }} className={className}>
        {children}
      </div>
    </SortableItemContext.Provider>
  )
}

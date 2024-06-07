import { useMemo, useState } from 'react'
import { DndContext, KeyboardSensor, PointerSensor, UniqueIdentifier, useSensor, useSensors } from '@dnd-kit/core'
import type { Active, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, rectSortingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { Slot } from '@radix-ui/react-slot'
import SortableOverlay from './components/sortable-overlay'
import SortableItem from './components/sortable-item'
import DragHandle from './components/drag-handle'

type SortableDataItem<T extends any> = { id: UniqueIdentifier } & { data: T }

type SortableListProps<T extends any> = {
  items: SortableDataItem<T>[]
  renderItem: (args: SortableDataItem<T>, index: number) => React.ReactElement
  onDragEnd?: (event: DragEndEvent) => void
  className?: string
  style?: React.CSSProperties
}

export default function SortableList<T extends any>({
  items,
  renderItem,
  onDragEnd,
  className,
  style,
}: SortableListProps<T>) {
  const [active, setActive] = useState<Active | undefined>(undefined)
  const activeItem = useMemo(() => items.find((item) => item.id === active?.id), [active, items])
  const activeItemIndex = useMemo(() => items.findIndex((item) => item.id === active?.id), [active, items])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  return (
    <DndContext
      sensors={sensors}
      onDragStart={({ active }) => {
        setActive(active)
      }}
      onDragCancel={() => {
        setActive(undefined)
      }}
      onDragEnd={(event) => {
        if (event.over && event.over.id !== event.active?.id) {
          onDragEnd?.(event)
        }
        setActive(undefined)
      }}
    >
      <SortableContext items={items} strategy={rectSortingStrategy}>
        <div className={className} style={style}>
          {items.map((item, index) => (
            <Slot key={item.id}>{renderItem(item, index)}</Slot>
          ))}
        </div>
      </SortableContext>
      <SortableOverlay>{activeItem ? renderItem(activeItem, activeItemIndex) : null}</SortableOverlay>
    </DndContext>
  )
}

SortableList.Item = SortableItem
SortableList.DragHandle = DragHandle

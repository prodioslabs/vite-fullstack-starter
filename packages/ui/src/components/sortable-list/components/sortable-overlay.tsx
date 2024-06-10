import { DragOverlay, defaultDropAnimationSideEffects } from '@dnd-kit/core'
import type { DropAnimation } from '@dnd-kit/core'

const dropAnimationConfig: DropAnimation = {
  duration: 100,
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0.4',
      },
    },
  }),
}

interface Props {}

export default function SortableOverlay({ children }: React.PropsWithChildren<Props>) {
  return <DragOverlay dropAnimation={dropAnimationConfig}>{children}</DragOverlay>
}

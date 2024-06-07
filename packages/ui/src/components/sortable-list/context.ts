import { createContext } from 'react'
import { DraggableSyntheticListeners } from '@dnd-kit/core'

export type Context = {
  attributes: Record<string, any>
  listeners: DraggableSyntheticListeners
  ref(node: HTMLElement | null): void
}

export const SortableItemContext = createContext<Context>({
  attributes: {},
  listeners: undefined,
  ref() {},
})

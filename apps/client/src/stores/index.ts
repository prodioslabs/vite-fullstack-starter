import { create } from 'zustand'

type AppStore = Record<string, never>

export const useAppStore = create<AppStore>(() => ({}))

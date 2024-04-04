import { create } from 'zustand'

type AppStore = {}

export const useAppStore = create<AppStore>(() => ({}))

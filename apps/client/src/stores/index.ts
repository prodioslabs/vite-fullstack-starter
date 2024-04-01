import { create } from 'zustand'

type User = {}

type AppStore = {
  user?: User
  setUser: (user?: User) => void
  isAuthenticated: boolean
}

export const useAppStore = create<AppStore>((set, get) => ({
  user: undefined,
  setUser: (user) => {
    set({ user })
  },
  isAuthenticated: !!get().user,
}))

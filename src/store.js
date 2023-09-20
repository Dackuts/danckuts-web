import { createStore } from 'zustand/vanilla'
import { useStore } from 'zustand'

export const tokenStore = createStore((set) => ({
  token: null,
  setToken: (token) => set({ token }),
}))

export const useTokenStore = (selector) => useStore(tokenStore, selector);
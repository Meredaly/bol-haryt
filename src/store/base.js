import { defineStore } from 'pinia'

export const useBase = defineStore({
  id: 'base',
  state: () => ({
    BASE_URL: import.meta.env.VITE_APP_BASE_URL
  })
})

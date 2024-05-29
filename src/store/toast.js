import { defineStore } from 'pinia'
export const useToast = defineStore({
  id: 'toast',
  state: () => ({
    toasts: []
  }),
  getters: {
    getToasts: (state) => state.toasts
  },
  actions: {
    addToast({ text, status = 'success' }) {
      let id = new Date().getTime()
      this.toasts.push({
        id,
        status,
        text
      })
      setTimeout(() => {
        this.toasts = this.toasts.filter((item) => item.id !== id)
      }, 2000)
    }
  }
})

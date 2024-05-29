import { defineStore } from 'pinia'
import { GET_NOTIFICATIONS } from '@/api/notification.api'

export const useNotification = defineStore({
  id: 'notification',
  state: () => ({
    notificationCounts: {}
  }),
  getters: {
    getNotificationCounts() {
      return this.notificationCounts
    }
  },
  actions: {
    async fetchNotifications() {
      try {
        const { data } = await GET_NOTIFICATIONS()
        this.notificationCounts = {
          order: data.new_order,
          products: data.new_products,
          verify: data.product_verify
        }
      } catch (error) {
        console.error(error)
      }
    }
  }
})

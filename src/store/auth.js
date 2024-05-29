import { defineStore } from 'pinia'
import { useCookies } from 'vue3-cookies'
import router from '@/router'
import { CHECK_AUTH } from '../api/auth.api'
import { CHECK_SELLER_AUTH } from '../api/auth-seller.api'

export const useAuth = defineStore({
  id: 'auth',
  state: () => ({
    auth: false,
    user: {
      name: ''
    },
    role: null
  }),
  getters: {
    isAuth() {
      return this.auth
    },
    getUser() {
      return this.user
    },
    getRole() {
      return this.role
    }
  },
  actions: {
    async getProfile() {
      const { cookies } = useCookies()
      if (cookies.get('AuthorizationAdmin')) {
        await this.getPersonnelProfile()
        return
      }
      if (cookies.get('AuthorizationSeller')) {
        await this.getSellerProfile()
        return
      }
      router.push('/login')
    },
    async getPersonnelProfile() {
      try {
        const { data, status } = await CHECK_AUTH()
        this.user = data
        this.auth = true
        this.role = data?.permission ? 'ADMIN' : 'MANAGER'
      } catch (error) {
        console.error(error)
        return null
      }
    },
    async getSellerProfile() {
      try {
        const { data } = await CHECK_SELLER_AUTH()
        this.user = data
        this.auth = true
        this.role = 'SELLER'
      } catch (error) {
        console.error(error)
        return null
      }
    },
    logOut() {
      this.user = null
      this.auth = false
      const { cookies } = useCookies()
      cookies.remove('AuthorizationAdmin')
      cookies.remove('AuthorizationSeller')
      router.push('/login')
    }
  }
})

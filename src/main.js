import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import router from './router'

import ru from '@/locales/ru'
import tm from '@/locales/tm'

import App from '@/App.vue'

const pinia = createPinia()
const app = createApp(App)
import './plugins/chart.js'
const i18n = createI18n({
  locale: 'ru',
  globalInjection: true,
  messages: {
    ru: ru,
    tm: tm
  }
})

app.use(router)
app.use(pinia)
app.use(i18n)
app.mount('#app')

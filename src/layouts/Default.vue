<script setup>
  import { ref, onUnmounted, computed, onMounted } from 'vue'

  import TheSidebar from '@/components/TheSidebar.vue'
  import TheHeader from '@/components/header/TheHeader.vue'

  import { useAuth } from '@/store/auth'
  import { useNotification } from '@/store/notification'

  const auth = useAuth()
  const notification = useNotification()

  const isAuth = computed(() => auth.isAuth)
  const isNotSeller = computed(() => auth.getRole === 'MANAGER' || auth.getRole === 'ADMIN')

  const notificationsInterval = ref(null)
  notificationsInterval.value = setInterval(() => {
    if (isNotSeller.value) {
      notification.fetchNotifications()
    }
  }, 3000)

  onMounted(() => {
    if (isNotSeller.value) {
      notification.fetchNotifications()
    }
  })

  onUnmounted(() => {
    setInterval(notificationsInterval.value)
  })
</script>

<template>
  <div v-if="isAuth" class="wrapper">
    <div class="wrapper__sidebar">
      <the-sidebar />
    </div>
    <div class="wrapper__main">
      <div class="wrapper__header">
        <the-header />
      </div>
      <div class="wrapper__body">
        <router-view />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .wrapper {
    display: flex;
    padding: 20px;
    height: 100vh;
    gap: 20px;
    // .wrapper__siebar
    &__sidebar {
      width: 250px;
      height: 100%;
    }
    // .wrapper__main
    &__main {
      flex: 1 1;
      height: 100%;
      display: grid;
      grid-template-rows: 80px 1fr;
      grid-gap: 20px;
    }
    // .wrapper__head
    &__head {
    }
    // .wrapper__body
    &__body {
      overflow: hidden;
    }
  }
</style>

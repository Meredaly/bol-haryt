<script setup>
  import { computed } from 'vue'
  import { useRouter } from 'vue-router'

  import MButton from '@/UI/MButton.vue'
  import MIcon from '@/UI/MIcons.vue'
  import HeaderProfile from './HeaderProfile.vue'
  import HeaderLang from './HeaderLang.vue'

  import { useAuth } from '@/store/auth'
  import { useNotification } from '@/store/notification'

  const auth = useAuth()

  const isNotSeller = computed(() => auth.getRole !== 'SELLER')

  const notification = useNotification()

  const router = useRouter()
  const openNewOrders = () => {
    router.push('/orders?status=AC')
  }

  const openNewProducts = () => {
    router.push(
      '/products?page_size=100&page=1&search=&sort_key=sort_date&filter_key=&filter_value=&filter_name=&status=under_review&sort_value=dec'
    )
  }

  const notificationCounts = computed(() => notification.getNotificationCounts)
</script>

<template>
  <div class="header _box">
    <div class="header__wrapper">
      <div class="header__left">
        <m-button styles="light" large only-icon icon="navigation" />
      </div>
      <div class="header__right">
        <div class="header__lang">
          <header-lang />
        </div>
        <div v-if="isNotSeller" class="header__notifications">
          <button @click="openNewOrders" class="header__notification">
            <m-icon name="cart" />
            <p v-if="notificationCounts.order">{{ notificationCounts.order }}</p>
          </button>
          <button @click="openNewProducts" class="header__notification">
            <m-icon name="grid" />
            <p v-if="notificationCounts.products">{{ notificationCounts.products }}</p>
          </button>
        </div>
        <div class="header__profile">
          <header-profile />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .header {
    width: 100%;
    height: 100%;

    // .header__wrapper
    &__wrapper {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    // .header__left
    &__left {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
    }

    // .header__right
    &__right {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 30px;
    }

    // .header__notifications
    &__notifications {
      display: flex;
      gap: 20px;
    }
    // .header__notification
    &__notification {
      position: relative;
      background-color: var(--gray-100);
      color: var(--gray-700);
      padding: 9px;
      border-radius: 6px;
      position: relative;
      p {
        top: -8px;
        right: -8px;
        font-size: 12px;
        line-height: 12px;
        min-width: 16px;
        padding: 2px 4px;
        position: absolute;
        background-color: var(--danger-600);
        color: var(--white);
        border-radius: 20px;
      }
    }

    // .header__profile
    &__profile {
    }
  }
</style>

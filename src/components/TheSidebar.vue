<script setup>
  import { ref, computed } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useRoute, useRouter } from 'vue-router'
  import MIcons from '@/UI/MIcons.vue'

  import { useAuth } from '@/store/auth'

  const { t } = useI18n()

  const route = useRoute()
  const router = useRouter()

  const auth = useAuth()
  const role = computed(() => auth.getRole)

  const menu = ref([
    { id: 1, title: 'sidebar.stats', link: '/stats', icon: 'chartMultiple', roles: ['ADMIN'] },
    {
      id: 2,
      title: 'sidebar.products',
      link: '/products',
      icon: 'grid',
      roles: ['ADMIN', 'MANAGER', 'SELLER'],
      isOpen: false,
      sub: [
        { id: 1, title: 'sidebar.all', link: '/products' },
        { id: 2, title: 'sidebar.underReview', link: '/products?status=under_review' },
        { id: 3, title: 'sidebar.confirmed', link: '/products?status=confirmed' },
        { id: 4, title: 'sidebar.rejected', link: '/products?status=rejected' }
      ]
    },
    {
      id: 3,
      title: 'sidebar.orders',
      link: '/orders',
      icon: 'cart',
      roles: ['ADMIN', 'MANAGER'],
      isOpen: false,
      sub: [
        { id: 1, title: 'sidebar.all', link: '/orders' },
        { id: 2, title: 'sidebar.accepted', link: '/orders?status=AC' },
        { id: 3, title: 'sidebar.canceled', link: '/orders?status=CA' },
        { id: 4, title: 'sidebar.return', link: '/orders?status=RE' },
        { id: 5, title: 'sidebar.dispatch', link: '/orders?status=SE' },
        { id: 6, title: 'sidebar.completed', link: '/orders?status=SU' }
      ]
    },
    {
      id: 4,
      title: 'sidebar.orders',
      link: '/orders-seller',
      icon: 'cart',
      roles: ['SELLER'],
      isOpen: false,
      sub: [
        { id: 1, title: 'sidebar.all', link: '/orders-seller' },
        { id: 2, title: 'sidebar.accepted', link: '/orders-seller?status=AC' },
        { id: 3, title: 'sidebar.canceled', link: '/orders-seller?status=CA' },
        { id: 4, title: 'sidebar.return', link: '/orders-seller?status=RE' },
        { id: 5, title: 'sidebar.dispatch', link: '/orders-seller?status=SE' },
        { id: 6, title: 'sidebar.completed', link: '/orders-seller?status=SU' }
      ]
    },
    { id: 5, title: 'sidebar.chats', link: '/chats', icon: 'chat', roles: ['ADMIN', 'MANAGER', 'SELLER'] },
    { id: 6, title: 'sidebar.adminChats', link: '/admin-chats', icon: 'chat', roles: ['ADMIN', 'MANAGER'] },
    { id: 7, title: 'sidebar.comments', link: '/comments', icon: 'comment', roles: ['ADMIN', 'MANAGER', 'SELLER'] },
    { id: 8, title: 'sidebar.personal', link: '/personal', icon: 'chartMultiple', roles: ['ADMIN'] },
    { id: 9, title: 'sidebar.banners', link: '/banners', icon: 'imageShadow', roles: ['ADMIN'] },
    { id: 10, title: 'sidebar.users', link: '/users', icon: 'bagTag', roles: ['ADMIN'] },
    { id: 11, title: 'sidebar.categories', link: '/categories', icon: 'bulletList', roles: ['ADMIN'] },
    { id: 12, title: 'sidebar.characteristics', link: '/characteristics', icon: 'detailList', roles: ['ADMIN'] },
    { id: 13, title: 'sidebar.brands', link: '/brands', icon: 'bagTag', roles: ['ADMIN'] },
    { id: 14, title: 'sidebar.tags', link: '/tags', icon: 'tag', roles: ['ADMIN'] },
    { id: 15, title: 'sidebar.shops', link: '/shops', icon: 'home', roles: ['ADMIN'] },
    {
      id: 16,
      title: 'sidebar.withdrawer',
      link: '/withdrawer',
      icon: 'moneyHand',
      roles: ['ADMIN', 'MANAGER', 'SELLER']
    },
    { id: 17, title: 'sidebar.shipping', link: '/shippings', icon: 'boxMultipleSearch', roles: ['ADMIN'] },
    { id: 18, title: 'sidebar.location', link: '/locations', icon: 'location', roles: ['ADMIN'] },
    { id: 19, title: 'sidebar.paymentMethods', link: '/payment-methods', icon: 'moneyHand', roles: ['ADMIN'] }
  ])

  const openMenu = (menuItem) => {
    router.push(menuItem.link)
  }

  const routePath = computed(() => route.path)

  const isActiveSub = (link) => {
    const routeStatus = route.query.status
    if (!routeStatus && !link.includes('status')) {
      return true
    }
    if (link.includes(routeStatus) && !!routeStatus) {
      return true
    }
    return false
  }
</script>

<template>
  <div class="sidebar _box">
    <div class="sidebar__box">
      <div class="sidebar__header">
        <div class="sidebar__logo">
          <img src="@/assets/images/logo.png" alt="logo" />
        </div>
      </div>
      <div class="sidebar__menu">
        <div class="menu">
          <div class="menu__body">
            <ul class="menu__list">
              <template v-for="menuItem in menu" :key="menuItem.id">
                <li
                  v-if="menuItem.roles.includes(role)"
                  :class="[
                    'menu__item',
                    {
                      _active: menuItem.link === routePath
                    }
                  ]"
                >
                  <div @click="openMenu(menuItem)" class="menu__item-button">
                    <a @click.prevent :href="menuItem.link" exact class="menu__link paragraph">
                      <m-icons :name="menuItem.icon" />
                      <p>{{ t(menuItem.title) }}</p>
                    </a>
                    <div v-if="menuItem.sub" class="menu__item-arrow">
                      <m-icons name="chevronBottom" />
                    </div>
                  </div>
                  <div v-if="menuItem.sub && menuItem.link === routePath" class="menu__sub">
                    <ul class="menu__sub-list">
                      <li v-for="subItem in menuItem.sub" class="menu__sub-item">
                        <a
                          @click.prevent="openMenu(subItem)"
                          :href="subItem.link"
                          :class="[
                            'menu__sub-link',
                            {
                              _active: isActiveSub(subItem.link)
                            }
                          ]"
                        >
                          <p>{{ t(subItem.title) }}</p>
                        </a>
                      </li>
                    </ul>
                  </div>
                </li>
              </template>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .sidebar {
    width: 100%;
    height: 100%;
    padding: 20px 16px;
    // .sidebar__box
    &__box {
      height: 100%;
      overflow: auto;
      display: flex;
      flex-direction: column;
    }
    // .sidebar__logo
    &__logo {
      display: flex;
      align-items: center;
      justify-content: center;
      img {
        width: auto;
        height: 70px;
      }
    }
    // .sidebar__header
    &__header {
      margin-bottom: 25px;
    }
    // .sidebar__logo
    &__logo {
    }
    // .sidebar__menu
    &__menu {
    }
    // .sidebar__log-out
    &__log-out {
      margin-top: auto;
    }
  }
  .menu {
    // .menu__body
    &__body {
    }
    // .menu__list
    &__list {
    }
    // .menu__item
    &__item {
      &:not(:last-child) {
        margin-bottom: 10px;
      }

      &._active {
        .menu__item-arrow {
          transform: rotate(180deg);
        }
        .menu__item-button {
          background-color: var(--primary-100);
          color: var(--gray-800);
        }
      }
    }

    // .menu__item-button
    &__item-button {
      padding: 16px;
      border-radius: var(--button-radius);
      color: var(--gray-700);
      display: flex;
      justify-content: space-between;
      cursor: pointer;
      &:hover {
        background-color: var(--primary-100);
        color: var(--gray-800);
      }
    }
    // .menu__link
    &__link {
      display: flex;
      align-items: center;
      :deep(.icon) {
        width: 16px;
        height: 16px;
        svg {
          width: 100%;
          height: 100%;
        }
      }
      p {
        padding-left: 10px;
      }
    }
    // .menu__sub
    &__sub {
      width: 100%;
      margin-top: 6px;
    }
    // .menu__sub-list
    &__sub-list {
      width: 100%;
      background-color: var(--primary-100);
      color: var(--gray-800);
      padding: 10px;
      border-radius: var(--button-radius);
    }
    // .menu__sub-item
    &__sub-item {
      &:not(:first-child) {
        margin-top: 4px;
      }
    }
    // .menu__sub-link
    &__sub-link {
      display: block;
      padding: 6px 10px;
      border-radius: var(--button-radius);
      &:hover,
      &._active {
        background-color: var(--primary-200);
        color: var(--primary-800);
      }
    }
  }
</style>

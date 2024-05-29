<script setup>
  import { storeToRefs } from 'pinia'
  import { useAuth } from '@/store/auth'
  import MIcons from '@/UI/MIcons.vue'
  import { useDropdown } from '@/composables/dropdown'
  import { onMounted } from 'vue'

  const { dropdownBody, dropdownMenu, showDropdown, closeDropdown, openDropdown } = useDropdown()

  const auth = useAuth()
  const { getUser: user } = storeToRefs(auth)

  const nameMinimize = (name = '') => {
    if (name) {
      const [first, last] = name.toUpperCase().split(' ')
      return (first?.slice(0, 1) || '') + (last?.slice(0, 1) || '')
    } else {
      return ''
    }
  }

  const logOut = () => {
    closeDropdown()
    auth.logOut()
  }

  onMounted(() => {
    document.addEventListener('click', (event) => {
      const isClickInside = dropdownBody.value?.contains(event.target)
      if (!isClickInside) {
        if (showDropdown.value) closeDropdown()
      }
    })
  })
</script>

<template>
  <div class="header-profile _active" ref="dropdownBody">
    <div @click="showDropdown ? closeDropdown() : openDropdown()" class="header-profile__button">
      <div class="header-profile__avatar">
        <img v-if="user?.image" src="" />
        <span v-else>{{ nameMinimize(user?.name) }}</span>
      </div>
    </div>
    <div v-if="showDropdown" ref="dropdownMenu" class="header-profile__menu">
      <div class="header-profile__list _box">
        <button @click="logOut" class="header-profile__item">
          <m-icons name="signOut" />
          <p>Выйти</p>
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .header-profile {
    position: relative;
    &._active {
      .header-profile__menu {
        display: block;
      }
    }
    // .header-profile__button
    &__button {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      overflow: hidden;
      background-color: var(--gray-700);
      cursor: pointer;
      user-select: none;
    }
    // .header-profile__avatar
    &__avatar {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center;
      }
      span {
        font-size: 18px;
        color: var(--white);
        font-weight: 600;
      }
    }
    // .header-profile__menu
    &__menu {
      position: absolute;
      top: calc(100% + 5px);
      right: 0;
      z-index: 3;
      display: none;
    }
    // .header-profile__list
    &__list {
      padding: 0;
      box-shadow: var(--hover-shadow);
      overflow: hidden;
    }
    // .header-profile__item
    &__item {
      display: block;
      width: 100%;
      padding: 14px 30px;
      background-color: transparent;
      font-size: 14px;
      display: flex;
      align-items: center;
      .icon {
        font-size: 20px;
        display: flex;
        margin-right: 20px;
      }
      p {
        font-weight: 400;
        font-size: 14px;
        line-height: 20px;
        color: var(--gray-700);
      }
      &:hover {
        background-color: var(--primary-100);
      }
    }
  }
</style>

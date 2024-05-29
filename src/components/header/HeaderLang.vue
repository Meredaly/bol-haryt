<script setup>
  import { ref, onMounted } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useCookies } from 'vue3-cookies'
  import MIcons from '@/UI/MIcons.vue'
  import { useDropdown } from '@/composables/dropdown'

  const { cookies } = useCookies()

  const { dropdownBody, dropdownMenu, showDropdown, openDropdown, closeDropdown } = useDropdown()
  const { locale } = useI18n()

  const langs = ref([
    { id: 'tm', name: 'Turkmen' },
    { id: 'ru', name: 'Русский' }
  ])

  const selectedLang = ref(null)

  const selectLang = (lang) => {
    selectedLang.value = lang
    locale.value = lang.id
    cookies.set('lang', lang.id, 100000000)
    closeDropdown()
  }

  const toggleDropdown = () => {
    showDropdown.value ? closeDropdown() : openDropdown()
  }

  if (cookies.get('lang')) {
    let lang = langs.value.find((lang) => lang.id === cookies.get('lang')) || null
    if (lang) selectLang(lang)
  } else {
    selectedLang.value = langs.value.find((lang) => lang.id === locale.value) || null
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
  <div :class="['header-lang', { _active: showDropdown }]" ref="dropdownBody">
    <button @click="toggleDropdown" class="header-lang__button">
      <p>{{ selectedLang?.name }}</p>
      <m-icons name="chevronBottom" />
    </button>
    <div class="header-lang__menu" ref="dropdownMenu">
      <div class="header-lang__list _box">
        <button v-for="lang in langs" :key="lang.id" @click="selectLang(lang)" class="header-lang__item">
          <p>{{ lang.name }}</p>
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .header-lang {
    position: relative;
    &._active {
      .header-lang__button {
        background-color: var(--hover-light);
      }
      .header-lang__menu {
        visibility: visible;
        opacity: 1;
        top: calc(100% + 5px);
      }
    }
    // .header-lang__button
    &__button {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 10px 14px;
      background-color: transparent;
      color: var(--dark);
      border-radius: 6px;
      p {
        font-weight: 400;
        font-size: 14px;
        line-height: 20px;
      }
      &:deep() {
        svg {
          width: 16px;
          height: 16px;
        }
      }
    }
    // .header-lang__menu
    &__menu {
      position: absolute;
      transition: 0.2s;
      top: calc(100% + 15px);
      right: 0;
      z-index: 1;
      visibility: hidden;
      opacity: 0;
    }
    // .header-lang__list
    &__list {
      padding: 2px;
      box-shadow: var(--hover-shadow);
      overflow: hidden;
    }
    // .header-lang__item
    &__item {
      display: block;
      width: 100%;
      padding: 10px 24px;
      border-radius: var(--box-radius);
      background-color: transparent;
      font-size: 14px;
      display: flex;
      align-items: center;
      color: var(--dark);
      p {
        font-weight: 400;
        font-size: 14px;
        line-height: 20px;
      }
      &:hover {
        background-color: var(--primary-100);
      }
    }
  }
</style>

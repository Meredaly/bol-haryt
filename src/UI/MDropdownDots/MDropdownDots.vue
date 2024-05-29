<script setup>
  import { computed, ref, onMounted } from 'vue'
  import { useI18n } from 'vue-i18n'

  import MIcons from '@/UI/MIcons.vue'
  import MTextFiled from '@/UI/MTextFiled.vue'
  import MDropdownSub from './MDropdownSub.vue'
  import { useDropdown } from '@/composables/dropdown'

  const { t } = useI18n()

  const { dropdownBody, dropdownMenu, showDropdown } = useDropdown()

  const emit = defineEmits(['selectItem', 'search', 'checkedItem'])

  const props = defineProps({
    items: { type: Array, default: () => [] },
    selectedItem: { type: Object, default: null },
    background: { type: Boolean, default: false },
    searchable: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    icon: { type: String, default: 'moreVertical' }
  })

  const search = ref('')
  const selectItem = (item) => {
    closeDropdown()
    search.value = ''
    emit('selectItem', item)
  }

  const openDropdown = () => {
    showDropdown.value = true
  }

  const classes = computed(() => [
    'dropdown-dots',
    {
      'dropdown-dots--background': props.background,
      'dropdown-dots--active': showDropdown.value,
      'dropdown-dots--disabled': props.disabled
    }
  ])

  const searching = (text) => {
    emit('search', text)
    search.value = text
  }

  const closeDropdown = () => {
    searching('')
    showDropdown.value = false
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
  <div :class="classes" ref="dropdownBody">
    <button
      @click="showDropdown ? closeDropdown() : openDropdown()"
      :disabled="props.disabled"
      class="dropdown-dots__button"
    >
      <m-icons :name="props.icon" />
    </button>
    <div v-if="showDropdown" ref="dropdownMenu" class="dropdown-dots__menu _box">
      <div v-if="searchable" class="dropdown-dots__search">
        <m-text-filed
          @input="(e) => searching(e.target.value)"
          :value="search"
          :placeholder="t('search')"
          prepend-icon="search"
          background
        />
      </div>
      <m-dropdown-sub @select-item="selectItem" :selected-item="selectedItem" :items="items" />
    </div>
  </div>
</template>

<style lang="scss">
  .dropdown-dots {
    position: relative;
    width: fit-content;
    // .dropdown-dots__button
    &__button {
      border: 1px solid var(--gray-700);
      border-radius: var(--button-radius);
      color: var(--gray-700);
      background-color: transparent;
      position: relative;
      padding: 9px;
      width: fit-content;
    }

    &--background {
      .dropdown-dots__button {
        background-color: var(--input_background);
        border-color: var(--input_background);
      }
    }
    &--disabled {
      .dropdown-dots__button {
        background-color: transparent;
        border-color: var(--gray-100);
      }
      .dropdown-dost__menu {
        display: none;
      }
    }

    &--active {
      .dropdown-dots__button {
        border-color: var(--primary-600);
      }

      .dropdown-dots__menu {
        visibility: visible;
        opacity: 1;
      }
    }
    // .dropdown-dots__button-icon
    &__button-icon {
      font-size: 20px;
      display: flex;
      .icon {
        display: flex;
        svg {
          width: 20px;
          height: 20px;
        }
      }
    }
    // .dropdown-dots__menu
    &__menu {
      position: absolute;
      top: calc(100% + 10px);
      right: 0;
      width: 100%;
      z-index: 3;
      box-shadow: var(--hover-shadow);
      padding: 0;
      max-height: 300px;
      overflow: auto;
      width: max-content;
      max-width: 300px;
      &_top {
        top: auto;
        bottom: calc(100% + 10px);
      }
    }
    // .dropdown-dots__search
    &__search {
      padding: 10px;
      width: 100%;
      border-bottom: 0.5px solid var(--gray-100);
    }
    // .dropdown-dots__list
    &__list {
    }
    // .dropdown-dots__item-box
    &__item-box {
      &:not(:first-child) {
        border-top: 1px solid var(--gray-100);
      }
    }

    // .dropdown-dots__item
    &__item {
      width: 100%;
      padding: 10px 20px;
      cursor: pointer;
      pointer-events: all;
      display: flex;
      align-items: center;
      font-weight: 400;
      font-size: 14px;
      line-height: 20px;
      color: var(--gray-700);
      &:hover {
        background-color: var(--primary-200);
      }
      &._active {
        background-color: var(--primary-100);
      }
    }
    // .dropdown-dots__item-text
    &__item-text {
    }
    // .dropdown-dots__sub
    &__sub {
      border-top: 1px solid var(--gray-100);
      .dropdown-dots__item {
        padding-left: calc(40px * var(--index));
      }
    }
  }
</style>

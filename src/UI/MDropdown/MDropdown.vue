<script setup>
  import { computed, ref, onMounted } from 'vue'
  import { useI18n } from 'vue-i18n'

  import MIcons from '@/UI/MIcons.vue'
  import MTextFiled from '@/UI/MTextFiled.vue'
  import MDropdownSub from './MDropdownSub.vue'
  import { useDropdown } from '@/composables/dropdown'

  const { t } = useI18n()

  const { dropdownBody, dropdownMenu, showDropdown, showTop } = useDropdown()

  const emit = defineEmits(['selectItem', 'checkedItem', 'search', 'remove'])

  const props = defineProps({
    label: { type: String, default: null },
    placeholder: { type: String, default: '' },
    items: { type: Array, default: () => [] },
    width: { type: [String, Number], default: null },
    selectedItem: { type: Object, default: null },
    background: { type: Boolean, default: false },
    searchable: { type: Boolean, default: false },
    required: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    error: { type: Boolean, default: false },
    showRemove: { type: Boolean, default: false }
  })

  const search = ref('')
  const selectItem = (item) => {
    closeDropdown()
    search.value = ''
    emit('selectItem', item)
  }

  const openDropdown = () => {
    if (!props.readonly) {
      showDropdown.value = true
      const bodyPosition = dropdownBody.value.getBoundingClientRect()

      const dropdownItemsHeight = props.items.length > 7 ? 7 * 40 : props.items.length * 40
      const searchableHeight = props.searchable ? 64 : 0
      const addButtonHeight = props.appendButtonText ? 40 : 0
      const dropdownHeight = dropdownItemsHeight + searchableHeight + addButtonHeight + 70
      const bottomCount = window.innerHeight - bodyPosition.y
      showTop.value = bottomCount < dropdownHeight
    }
  }

  const classes = computed(() => [
    'dropdown',
    {
      'dropdown--background': props.background,
      'dropdown--active': showDropdown.value,
      'dropdown--top': showTop.value,
      'dropdown--error': props.error,
      'dropdown--required': props.required,
      'dropdown--disabled': props.disabled
    }
  ])

  const searchInterval = ref(null)
  const searching = (text) => {
    search.value = text
    clearTimeout(searchInterval.value)
    searchInterval.value = setTimeout(() => {
      emit('search', text)
    }, 500)
  }

  const closeDropdown = () => {
    searching('')
    showDropdown.value = false
  }
  const removeSelect = () => {
    emit('remove')
  }

  const toggleDropdown = () => {
    if (props.disabled) return

    if (showDropdown.value) {
      closeDropdown()
    } else {
      openDropdown()
    }
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
  <div :class="classes" ref="dropdownBody" :style="`width: ${width}px`">
    <div v-if="label" class="dropdown__label">{{ label }}</div>
    <div class="dropdown__box">
      <div class="dropdown__button">
        <p @click="toggleDropdown" v-if="selectedItem" class="dropdown__button-text">
          {{ selectedItem.name }}
        </p>
        <p v-if="!selectedItem" @click="toggleDropdown" class="dropdown__button-placeholder">{{ placeholder }}</p>
        <div v-if="selectedItem?.id && showRemove" @click="toggleDropdown" class="dropdown__remove">
          <button @click="removeSelect">
            <MIcons name="dismiss" />
          </button>
        </div>
        <span @click="toggleDropdown" class="dropdown__button-icon">
          <m-icons name="chevronBottom" />
        </span>
      </div>
      <div v-if="showDropdown" ref="dropdownMenu" class="dropdown__menu _box">
        <div v-if="searchable" class="dropdown__search">
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
  </div>
</template>

<style lang="scss">
  .dropdown {
    width: 100%;
    position: relative;
    // .dropdown__label
    &__label {
      font-weight: 500;
      font-size: 12px;
      line-height: 14px;
      color: var(--gray-800);
      padding-bottom: 4px;
    }
    // .dropdown__box
    &__box {
    }
    // .dropdown__button
    &__button {
      width: 100%;
      border: 1px solid var(--gray-700);
      border-radius: var(--button-radius);
      background-color: transparent;
      position: relative;
      display: flex;
      align-items: center;

      cursor: pointer;
      user-select: none;
    }

    &--required {
      .dropdown__label {
        &:after {
          content: '*';
          padding-left: 2px;
          color: var(--danger-600);
        }
      }
    }

    &--background {
      .dropdown__button {
        background-color: var(--input_background);
        border-color: var(--input_background);
      }
    }
    &--top {
      .dropdown__menu {
        top: auto;
        bottom: calc(100% + 10px);
      }
    }

    &--active {
      .dropdown__button {
        border-color: var(--primary-600);
      }
      .dropdown__button-icon {
        span {
          transform: rotate(180deg);
        }
      }

      .dropdown__menu {
        visibility: visible;
        opacity: 1;
      }
    }
    // .dropdown__button-text
    &__button-text {
      font-weight: 400;
      font-size: 14px;
      line-height: 16px;
      color: var(--gray-800);
      padding: 9px 5px 9px 19px;
      flex: 1 1;
      height: 38px;
    }
    // .dropdown__button-placeholder
    &__button-placeholder {
      font-weight: 400;
      font-size: 14px;
      line-height: 16px;
      color: var(--gray-600);
      padding: 9px 5px 9px 19px;
      flex: 1 1;
    }
    // .dropdown__remove
    &__remove {
      padding-right: 5px;
      button {
        background: var(--danger-100);
        border: 1px solid var(--danger-300);
        border-radius: 50%;
        padding: 4px;
        color: var(--danger-600);
        &:hover {
          background-color: var(--danger-600);
          color: var(--white);
        }
        .icon {
          svg {
            width: 12px;
            height: 12px;
          }
        }
      }
    }
    // .dropdown__button-icon
    &__button-icon {
      font-size: 20px;
      display: flex;
      padding: 9px 19px 9px 5px;
      .icon {
        display: flex;
      }
    }
    // .dropdown__menu
    &__menu {
      position: absolute;
      top: calc(100% + 10px);
      right: 0;
      width: 100%;
      z-index: 3;
      visibility: hidden;
      opacity: 0;
      box-shadow: var(--hover-shadow);
      padding: 0;
      max-height: 300px;
      overflow: auto;
      width: 100%;
      &_top {
        top: auto;
        bottom: calc(100% + 10px);
      }
    }
    // .dropdown__search
    &__search {
      padding: 10px;
      width: 100%;
      border-bottom: 0.5px solid var(--gray-100);
    }
    // .dropdown__list
    &__list {
    }
    // .dropdown__item-box
    &__item-box {
      &:not(:first-child) {
        border-top: 1px solid var(--gray-100);
      }
    }

    // .dropdown__item
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
    // .dropdown__item-text
    &__item-text {
    }
    // .dropdown__sub
    &__sub {
      border-top: 1px solid var(--gray-100);
      .dropdown__item {
        padding-left: calc(40px * var(--index));
      }
    }

    &--disabled {
      .dropdown__label {
      }
      .dropdown__button {
        background-color: transparent;
        border-color: var(--gray-100);

        cursor: not-allowed;
        pointer-events: all !important;
      }
      .dropdown__menu {
        display: none;
      }
    }

    &--error {
      animation: 0.2s invalid;
      .dropdown__label {
      }
      .dropdown__button {
        border-color: var(--danger-600);
      }
      .dropdown__menu {
        z-index: 1;
      }
    }
  }
  @keyframes invalid {
    0% {
      transform: translateX(0px);
    }
    25% {
      transform: translateX(5px);
    }
    50% {
      transform: translateX(0px);
    }
    75% {
      transform: translateX(-5px);
    }
    100% {
      transform: translateX(0px);
    }
  }
</style>

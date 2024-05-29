<script setup>
  import { computed, ref, onMounted } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useDropdown } from '@/composables/dropdown'
  import MIcons from '@/UI/MIcons.vue'
  import MTextFiled from '@/UI/MTextFiled.vue'
  import MDropdownSelectSub from './MDropdownSelectSub.vue'

  const { dropdownBody, dropdownMenu, showDropdown, showTop } = useDropdown()

  const props = defineProps({
    items: { type: Array, default: () => [] },
    placeholder: { type: String, default: '' },
    background: { type: Boolean, default: false },
    label: { type: String, default: null },
    selectedItems: { type: Array, default: () => [] },
    disabled: { type: Boolean, default: false },
    error: { type: Boolean, default: false },
    success: { type: Boolean, default: false },
    searchable: { type: Boolean, default: false },
    appendButtonText: { type: String, default: null },
    required: { type: Boolean, default: false }
  })

  const emit = defineEmits(['selectItem', 'search'])
  const { t } = useI18n()

  const search = ref('')
  const selectItem = (item) => {
    emit('selectItem', JSON.parse(JSON.stringify(item)))
  }

  const openDropdown = () => {
    showDropdown.value = true
    const bodyPosition = dropdownBody.value.getBoundingClientRect()

    const dropdownItemsHeight = props.items.length > 8 ? 8 * 44 : props.items.length * 44
    const searchableHeight = props.searchable ? 40 : 0
    const dropdownHeight = dropdownItemsHeight + searchableHeight + 58
    const bottomCount = window.innerHeight - bodyPosition.y
    showTop.value = bottomCount < dropdownHeight
  }

  const classes = computed(() => [
    'dropdown-select',
    {
      'dropdown-select--active': showDropdown.value,
      'dropdown-select--error': props.error && !props.success,
      'dropdown-select--success': props.success,
      'dropdown-select--background': props.background,
      'dropdown-select--disabled': props.disabled,
      'dropdown-select--required': props.required,
      'dropdown-select--top': showTop.value && showDropdown.value
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

  const selectedIds = computed(() => {
    return props.selectedItems?.map((item) => item.id) || []
  })

  const toggleDropdown = (e) => {
    if (props.disabled) return
    if (['dropdown-select__button-items', 'dropdown-select__button'].includes(e.target.className.toString())) {
      !showDropdown.value ? openDropdown() : closeDropdown()
    }
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
    <div v-if="props.label" class="dropdown-select__label">
      {{ props.label }}
    </div>
    <div @click="toggleDropdown" class="dropdown-select__button">
      <div v-if="props.selectedItems.length && !props.empty" class="dropdown-select__button-items">
        <div v-for="item in props.selectedItems" :key="item.id" class="dropdown-select__button-item">
          <p>{{ item.name }}</p>
          <button @click="selectItem(item)" :disabled="props.disabled">
            <MIcons name="dismiss" />
          </button>
        </div>
      </div>
      <p v-else-if="!props.empty" class="dropdown-select__placeholder">{{ props.placeholder }}</p>
      <MIcons name="chevronBottom" />
    </div>
    <div v-show="showDropdown" class="dropdown-select__menu _box" ref="dropdownMenu">
      <div v-if="searchable" class="dropdown-select__search">
        <m-text-filed
          @input="(e) => searching(e.target.value)"
          :value="search"
          :placeholder="t('search')"
          prepend-icon="search"
          background
        />
      </div>
      <m-dropdown-select-sub @select-item="selectItem" :selected-ids="selectedIds" :items="items" />
    </div>
  </div>
</template>

<style lang="scss">
  .dropdown-select {
    width: 100%;
    position: relative;
    // .dropdown-select__label
    &__label {
      font-weight: 500;
      font-size: 12px;
      line-height: 14px;
      color: var(--gray-800);
      padding-bottom: 4px;
    }

    // .dropdown-select__button
    &__button {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      cursor: pointer;
      user-select: none;
      border: 1px solid var(--gray-700);
      border-radius: var(--button-radius);
      background-color: transparent;
      position: relative;
      padding: 4px 19px;
      font-weight: 400;
      font-size: 14px;
      line-height: 16px;
      color: var(--text);
      min-height: 40px;

      & > span {
        transition: 0.2s;
        user-select: none;
        pointer-events: none;
      }
    }

    &--required {
      .dropdown-select__label {
        &:after {
          content: '*';
          padding-left: 2px;
          color: var(--danger-600);
        }
      }
    }

    &--background {
      .dropdown-select__button {
        background-color: var(--input_background);
        border-color: var(--input_background);
      }
      .dropdown-select__button-item {
        background-color: var(--white);
        border-color: var(--gray-200);
      }
    }

    &--active {
      .dropdown-select__button {
        border-color: var(--primary-600);
        & > span {
          transform: rotate(180deg);
        }
      }

      .dropdown-select__menu {
        visibility: visible;
        opacity: 1;
      }
    }

    // .dropdown-select__button-items
    &__button-items {
      flex: 1 1;
      padding-right: 10px;
      display: flex;
      flex-wrap: wrap;
      gap: 15px 10px;
    }
    // .dropdown-select__button-item
    &__button-item {
      display: flex;
      align-items: center;
      padding: 3px 5px 3px 10px;
      background: var(--gray-100);
      border: 1px solid var(--gray-300);
      border-radius: 16px;
      p {
        font-weight: 400;
        font-size: 14px;
        line-height: 20px;
        letter-spacing: 0.135px;
        color: var(--text);
        padding-right: 4px;
      }
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

    // .dropdown-select__placeholder
    &__placeholder {
      color: var(--gray-600);
    }

    // .dropdown-select__menu
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
    // .dropdown-select__search
    &__search {
      padding: 10px;
      width: 100%;
      border-bottom: 0.5px solid var(--gray-100);
    }

    // .dropdown-select__list
    &__list {
    }

    // .dropdown-select__item-box
    &__item-box {
      &:not(:first-child) {
        border-top: 1px solid var(--gray-100);
      }
    }

    // .dropdown-select__item
    &__item {
      width: 100%;
      padding: 10px 20px;
      cursor: pointer;
      pointer-events: all;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-weight: 400;
      font-size: 14px;
      line-height: 20px;
      color: var(--gray-700);
      &:hover {
        background-color: var(--primary-200);
      }
      &._active {
        background-color: var(--primary-100);
        .icon {
          color: var(--primary-600);
        }
      }
    }

    // .dropdown-select__item-text
    &__item-text {
    }
    // .dropdown-select__sub
    &__sub {
      border-top: 1px solid var(--gray-100);
      .dropdown-select__item {
        padding-left: calc(40px * var(--index));
      }
    }

    &--disabled {
      .dropdown-select__label {
      }
      .dropdown-select__button {
        background-color: transparent;
        border-color: var(--gray-100);

        cursor: not-allowed;
        pointer-events: all !important;
      }
      .dropdown-select__menu {
        display: none;
      }
    }
    &--error {
      animation: 0.2s invalid;
      .dropdown-select__label {
      }
      .dropdown-select__button {
        border-color: var(--danger-600);
      }
      .dropdown-select__menu {
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

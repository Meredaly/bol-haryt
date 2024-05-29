<script setup>
  import { ref, computed } from 'vue'
  import MButton from '@/UI/MButton.vue'
  import MDropdownDots from '@/UI/MDropdownDots'

  const emit = defineEmits(['selectItem', 'addItem', 'deleteItem'])

  const props = defineProps({
    items: { type: Array, default: () => [] },
    selectedItem: { type: Object, default: null },
    menu: { type: Array, default: () => [] },
    disabled: { type: Boolean, default: false }
  })

  const selectItem = (item) => {
    emit('selectItem', item)
  }

  const selectMenu = (item) => {
    emit('addItem', item)
  }

  const deleteItem = (index) => {
    emit('deleteItem', index)
  }

  const otherMenu = computed(() => {
    return props.menu.filter((menuItem) => {
      return !props.items?.some((item) => menuItem.name === item.name)
    })
  })
</script>

<template>
  <div class="tab-bar-mini">
    <div class="tab-bar-mini__wrapper">
      <div v-if="items?.length" class="tab-bar-mini__items">
        <div
          v-for="(item, index) in items"
          :class="['tab-bar-mini__item', { _active: item?.name && item.name === selectedItem?.name }]"
        >
          <div @click="selectItem(item)" class="tab-bar-mini__item-name">{{ item.name }}</div>
          <div class="tab-bar-mini__close">
            <m-button @click="deleteItem(index)" :disabled="disabled" icon="dismiss" styles="light" only-icon />
          </div>
        </div>
      </div>
      <div class="tab-bar-mini__others">
        <m-dropdown-dots icon="add" @select-item="selectMenu" :disabled="disabled" :items="otherMenu" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .tab-bar-mini {
    // .tab-bar-mini__wrapper
    &__wrapper {
      display: flex;
    }
    // .tab-bar-mini__items
    &__items {
      display: flex;
      gap: 10px;
    }
    // .tab-bar-mini__item
    &__item {
      display: flex;
      align-items: center;
      border: 1px solid var(--gray-300);
      color: var(--gray-600);
      border-radius: 50px;
      margin-left: -1px;
      cursor: pointer;
      &._active {
        background-color: var(--primary-600);
        color: var(--white);
        border-color: var(--primary-600);
      }
    }
    // .tab-bar-mini__item-name
    &__item-name {
      padding: 10px 16px;
      font-size: 15px;
      line-height: 20px;
      border-radius: 50px 0 0 50px;
    }
    // .tab-bar-mini__close
    &__close {
      padding: 6px 10px 6px 0px;
      border-radius: 0 50px 50px 0;
      :deep() {
        button {
          color: inherit;
          &:hover {
            color: inherit;
          }
        }
        svg {
          width: 16px;
          height: 16px;
        }
      }
    }
    .tab-bar-mini__items + .tab-bar-mini__others {
      margin-left: 10px;
    }
    // .tab-bar-mini__others
    &__others {
      display: flex;
      align-items: center;
      padding: 4px 0;
      &:deep() {
        .dropdown-dots__button {
          border-radius: 50%;
          border: 1px dashed var(--primary-600);
        }
        .dropdown-dots__button-icon {
          color: var(--primary-600);
        }
        .dropdown-dots__menu {
          left: 0;
          right: auto;
        }
      }
    }
  }
</style>

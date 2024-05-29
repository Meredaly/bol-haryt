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
      return !props.items.some((item) => menuItem.name === item.name)
    })
  })
</script>

<template>
  <div class="tab-bar">
    <div class="tab-bar__wrapper">
      <div v-if="items?.length" class="tab-bar__items">
        <div v-for="(item, index) in items" :class="['tab-bar__item', { _active: item?.name && item.name === selectedItem?.name }]">
          <div v-if="false" class="tab-bar__item-drag">
            <m-button icon="reOrderDots" styles="light" :disabled="disabled" only-icon class="column-drag-handle" />
          </div>
          <div @click="selectItem(item)" class="tab-bar__item-name">{{ item.name }}</div>
          <div class="tab-bar__close">
            <m-button @click="deleteItem(index)" :disabled="disabled" icon="dismiss" styles="light" only-icon />
          </div>
        </div>
      </div>
      <div class="tab-bar__others">
        <m-dropdown-dots icon="add" @select-item="selectMenu" :disabled="disabled" :items="otherMenu" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .tab-bar {
    border-bottom: 1px solid var(--gray-300);
    // .tab-bar__wrapper
    &__wrapper {
      display: flex;
    }
    // .tab-bar__items
    &__items {
      display: flex;
    }
    // .tab-bar__item
    &__item {
      display: flex;
      align-items: center;
      border: 1px solid var(--gray-300);
      border-bottom: 0px;
      color: var(--gray-600);
      border-radius: 4px 4px 0 0;
      margin-left: -1px;
      padding: 0px 10px;
      cursor: pointer;
      &._active {
        background-color: var(--primary-600);
        color: var(--white);
        border-color: var(--primary-600);
      }
    }
    // .tab-bar__item-drag
    &__item-drag {
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
    // .tab-bar__item-name
    &__item-name {
      padding: 6px 10px;
      font-size: 15px;
      line-height: 28px;
    }
    // .tab-bar__close
    &__close {
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

    .tab-bar__items + .tab-bar__others {
      margin-left: 10px;
    }
    // .tab-bar__others
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

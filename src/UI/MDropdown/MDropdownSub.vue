<script setup>
  import MDropdownSub from './MDropdownSub.vue'

  const emit = defineEmits(['selectItem'])

  const props = defineProps({
    items: { type: Array, default: () => [] },
    subIndex: { type: Number, default: 1 },
    selectedItem: { type: Object, default: null }
  })

  const selectItem = (item) => {
    emit('selectItem', item)
  }
</script>

<template>
  <div class="dropdown__list">
    <template v-for="item in items" :key="item.id">
      <div class="dropdown__item-box">
        <div @click="selectItem(item)" :class="['dropdown__item', { _active: selectedItem?.id === item?.id }]">
          <div class="dropdown__item-text">{{ item.name }}</div>
        </div>
        <div v-if="item.sub" class="dropdown__sub" :style="`--index: ${subIndex}`">
          <m-dropdown-sub @select-item="selectItem" :selected-item="selectedItem" :items="item.sub" :subIndex="subIndex + 1" />
        </div>
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped></style>

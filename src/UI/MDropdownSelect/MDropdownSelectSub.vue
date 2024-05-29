<script setup>
  import MIcons from '@/UI/MIcons.vue'
  import MDropdownSelectSub from './MDropdownSelectSub.vue'
  const emit = defineEmits(['selectItem'])

  const props = defineProps({
    items: { type: Array, default: () => [] },
    subIndex: { type: Number, default: 1 },
    selectedIds: { type: Array, default: () => [] }
  })

  const selectItem = (item) => {
    emit('selectItem', item)
  }
</script>
<template>
  <div class="dropdown-select__list">
    <template v-for="item in items" :key="item.id">
      <div class="dropdown-select__item-box">
        <div @click="selectItem(item)" :class="['dropdown-select__item', { _active: selectedIds.includes(item.id) }]">
          <div class="dropdown-select__item-text">{{ item.name }}</div>
          <MIcons :name="selectedIds.includes(item.id) ? 'checked' : 'unchecked'" />
        </div>
      </div>
      <div v-if="item.sub" class="dropdown-select__sub" :style="`--index: ${subIndex}`">
        <m-dropdown-select-sub @select-item="selectItem" :selected-ids="selectedIds" :items="item.sub" :subIndex="subIndex + 1" />
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped></style>

<script setup>
  const props = defineProps({
    gap: {
      type: [String, Number],
      default: 10
    },
    rowGap: {
      type: [String, Number],
      default: null
    },
    columnGap: {
      type: [String, Number],
      default: null
    },
    count: {
      type: [Number, String],
      default: 12
    }
  })
</script>

<template>
  <div
    :class="[
      'row',
      `gap-${props.gap}`,
      {
        'column-gap-15': props.columnGap == '15',
        'column-gap-20': props.columnGap == '20',
        'row-gap-15': props.rowGap == '15',
        'row-gap-20': props.rowGap == '20'
      }
    ]"
    :style="`grid-template-columns: repeat(${props.count}, 1fr)`"
  >
    <slot></slot>
  </div>
</template>

<style lang="scss" scoped>
  .row {
    display: grid;
    width: 100%;
  }
  .gap-10 {
    grid-row-gap: 10px;
    grid-column-gap: 10px;
  }
  .row-gap-15 {
    grid-row-gap: 15px;
  }
  .row-gap-20 {
    grid-row-gap: 20px;
  }
  .column-gap-15 {
    grid-column-gap: 15px;
  }
  .column-gap-20 {
    grid-column-gap: 20px;
  }
</style>

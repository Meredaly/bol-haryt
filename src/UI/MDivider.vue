<script setup>
  const props = defineProps({
    title: { type: String, default: null }
  })
</script>

<template>
  <div class="divider">
    <div v-if="title" class="divider__title">{{ title }}</div>
  </div>
</template>

<style lang="scss" scoped>
  .divider {
    border-bottom: 1px solid var(--gray-300);
    // .divider__title
    &__title {
      font-size: 16px;
      font-weight: 600;
      padding: 10px 0;
    }
  }
</style>

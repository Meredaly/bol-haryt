<template>
  <div class="link">
    <div v-if="label" class="link__label">{{ label }}</div>
    <div class="link__url">
      <a :href="url" target="_blank">{{ url }}</a>
    </div>
  </div>
</template>

<script setup>
  const props = defineProps({
    label: { type: String, default: null },
    url: { type: String, default: '' }
  })
</script>

<style lang="scss" scoped>
  .link {
    // .link__label
    &__label {
      font-weight: 500;
      font-size: 12px;
      line-height: 14px;
      color: var(--gray-800);
      padding-bottom: 4px;
    }
    // .link__url
    &__url {
      a {
        font-size: 14px;
        color: var(--primary-600);
        padding: 10px 0;
        display: block;
        &:hover {
          text-decoration: underline;
        }
      }
    }
  }
</style>

<script setup>
  const props = defineProps({
    image: { type: String, default: null },
    width: { type: [String, Number], default: null },
    height: { type: [String, Number], default: null },
    circle: { type: Boolean, default: false }
  })
</script>
<template>
  <div :class="['image', { _circle: props.circle }]" :style="`width:${width};min-width:${width}; height:${height}`">
    <div class="image__box">
      <img v-if="image" :src="image" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .image {
    width: 100%;
    height: 100%;
    border-radius: var(--button-radius);
    overflow: hidden;
    background-color: var(--gray-200);
    // .image__box
    &__box {
      width: 100%;
      height: 100%;
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center;
      }
    }
    &._circle {
      border-radius: 50%;
    }
  }
</style>

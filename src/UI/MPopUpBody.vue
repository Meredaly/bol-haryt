<script setup>
  import MButton from '@/UI/MButton.vue'
  const props = defineProps({
    width: {
      type: [String, Number],
      default: 600
    },
    title: {
      type: String,
      default: null
    }
  })
  const emit = defineEmits(['close'])
  const close = () => {
    emit('close')
  }
</script>

<template>
  <div class="pop-up">
    <div class="pop-up__wrapper _box" :style="`width: ${props.width}px`">
      <div class="pop-up__head">
        <h4 v-if="title" class="pop-up__title">{{ props.title }}</h4>
        <div class="pop-up__head-box">
          <slot name="head"></slot>
        </div>
        <div @click="close" class="pop-up__close">
          <m-button only-icon icon="dismiss" no-border styles="secondary" />
        </div>
      </div>
      <div class="pop-up__body">
        <slot></slot>
      </div>
      <div class="pop-up__bot">
        <slot name="bot"></slot>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .pop-up {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: var(--transparent_background);
    z-index: 9999;
    overflow: auto;
    padding: 20px;
    // .pop-up__wrapper
    &__wrapper {
      height: max-content;
      border-radius: 10px;
      padding: 20px 24px;
      margin: 100px auto;
      max-width: 100%;
      position: relative;
      z-index: 1;
    }
    // .pop-up__head
    &__head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 20px;
    }

    // .pop-up__head-box
    &__head-box {
      flex: 1 1;
    }
    // .pop-up__close
    &__close {
    }
    // .pop-up__title
    &__title {
      color: var(--gray-800);
    }
    // .pop-up__body
    &__body {
      margin-bottom: 40px;
    }
    // .pop-up__bot
    &__bot {
    }
  }
</style>

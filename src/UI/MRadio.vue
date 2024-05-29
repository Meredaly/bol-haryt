<template>
  <div :class="['radio', { 'radio--disabled': disabled, 'radio--active': status }]">
    <div @click="updateStatus" class="radio__button">
      <div class="radio__icon">
        <m-icons :name="status ? 'radio_button_filled' : 'radio_button_regular'" />
      </div>
      <div v-if="title" class="radio__text paragparh">{{ title }}</div>
    </div>
  </div>
</template>

<script setup>
  import MIcons from '@/components/app/MIcons.vue'

  const emit = defineEmits(['updateStatus'])

  const props = defineProps({
    status: { type: Boolean, default: false },
    title: { type: String, default: null },
    disabled: { type: Boolean, default: false }
  })

  const updateStatus = () => {
    !props.disabled && emit('updateStatus', true)
  }
</script>

<style lang="scss" scoped>
  .radio {
    cursor: pointer;
    user-select: none;
    &--active {
      .radio__icon {
        color: var(--primary-600);
      }
    }
    &--disabled {
      cursor: not-allowed;
      pointer-events: all !important;
      .radio__icon,
      .radio__text {
        color: var(--gray-600);
      }
    }
    // .radio__button
    &__button {
      display: flex;
      align-items: center;
    }
    // .radio__icon
    &__icon {
      font-size: 24px;
      color: var(--gray-600);
      .icon {
        display: flex;
      }
    }
    // .radio__text
    &__text {
      padding-left: 4px;
      color: var(--gray-800);
    }
  }
</style>

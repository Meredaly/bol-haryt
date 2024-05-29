<template>
  <button :class="classes" :disabled="props.disabled">
    <span v-if="props.icon" class="button__icon-left">
      <m-icons :name="props.icon" />
    </span>
    <span v-if="props.title" class="button__content">
      {{ props.title }}
    </span>
    <span v-if="props.rightIcon" class="button__icon-right">
      <m-icons :name="props.rightIcon" />
    </span>
    <slot></slot>
    <div v-if="loading" class="button__loading"></div>
  </button>
</template>

<script setup>
  import { computed } from 'vue'
  import MIcons from '@/UI/MIcons.vue'

  const props = defineProps({
    title: { type: String, default: null },
    icon: { type: String, default: null },
    rightIcon: { type: String, default: null },
    styles: { type: String, default: 'primary' },
    disabled: { type: Boolean, default: false },
    outline: { type: Boolean, default: false },
    block: { type: Boolean, default: false },
    small: { type: Boolean, default: false },
    large: { type: Boolean, default: false },
    soft: { type: Boolean, default: false },
    noBorder: { type: Boolean, default: false },
    onlyIcon: { type: Boolean, default: false },
    loading: { type: Boolean, default: false }
  })
  const classes = computed(() => [
    'button',
    `button__${props.styles}`,
    {
      button_small: props.small,
      button_large: props.large,
      button_block: props.block,
      button_outline: props.outline,
      button_disabled: props.disabled,
      button_soft: props.soft,
      'button__only-icon': props.onlyIcon,
      'button_no-border': props.noBorder,
      button_loading: props.loading
    }
  ])
</script>

<style lang="scss" scoped>
  .button {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 9px;
    border-radius: 6px;
    height: fit-content;
    border: 1px solid transparent;
    position: relative;

    // .button__icon-left
    &__icon-left {
      font-size: 16px;
      display: flex;
      :deep(.icon) {
        display: flex;
      }
    }
    &_disabled {
      cursor: not-allowed;
      pointer-events: all !important;
      user-select: none;
    }
    &_loading {
      .button__icon-left,
      .button__content,
      .button__icon-right {
        color: transparent;
      }
    }
    .button__icon-left + .button__content {
      padding-left: 3px;
    }
    // .button__content
    &__content {
      font-weight: 400;
      font-size: 14px;
      line-height: 20px;
      color: inherit;
    }
    .button__content + .button__icon-right {
      padding-left: 3px;
    }
    // .button__icon-right
    &__icon-right {
      font-size: 16px;
      display: flex;
      :deep(.icon) {
        display: flex;
      }
    }

    // .button__loading
    &__loading {
      position: absolute;
      border: 2px solid var(--white);
      width: 20px;
      height: 20px;
      border-radius: 50%;
      top: 50%;
      left: 50%;
      border-left-color: transparent;
      animation: loading 1s linear infinite;
      transform: translate(-50%, -50%);
      @keyframes loading {
        0% {
          transform: translate(-50%, -50%) rotate(0);
        }
        100% {
          transform: translate(-50%, -50%) rotate(360deg);
        }
      }
    }

    &.button__only-icon {
      padding: 9px;
      .button__icon-left,
      .button__icon-right {
      }
    }
    // .button_small
    &_small {
      padding: 9px;
      .button__icon-left + .button__content {
        padding-left: 2px;
      }
      .button__content + .button__icon-right {
        padding-left: 2px;
      }
      &.button__only-icon {
        padding: 2px;
        .button__icon-left,
        .button__icon-right {
          font-size: 20px;
        }
      }
    }
    // .button_large
    &_large {
      padding: 11px;
      .button__icon-left,
      .button__icon-right {
        font-size: 24px;
      }
      .button__icon-left + .button__content {
        padding-left: 4px;
      }
      .button__content {
        font-size: 16px;
        font-weight: 500;
        line-height: 19px;
      }
      .button__content + .button__icon-right {
        padding-left: 4px;
      }
      &.button__only-icon {
        padding: 8px;
        .button__icon-left,
        .button__icon-right {
          font-size: 24px;
        }
      }
    }
    // .button_block
    &_block {
      width: 100%;
    }
    // .button__primary
    &__primary {
      background: var(--primary-600);
      color: var(--white);
      border-color: var(--primary-600);

      &.button_soft {
        background: var(--primary-100);
        color: var(--primary-600);
        border-color: transparent;
      }
      &.button_outline {
        background: var(--primary-100);
        color: var(--primary-600);
        border-color: var(--primary-600);
      }
      &.button_no-border {
        background: transparent;
        color: var(--primary-600);
        border-color: var(--transparent);
      }
      &:hover {
        border-color: var(--primary-700);
        color: var(--white);
        background: var(--primary-700);
      }
    }

    // .button__secondary
    &__secondary {
      background: var(--gray-600);
      color: var(--white);
      border-color: var(--gray-600);

      &.button_soft {
        background: var(--gray-100);
        color: var(--gray-600);
      }
      &.button_outline {
        background: var(--gray-100);
        color: var(--gray-600);
        border-color: var(--gray-600);
      }
      &.button_no-border {
        background: transparent;
        color: var(--gray-600);
        border: transparent;
      }
      &:hover {
        color: var(--white);
        border-color: var(--gray-700);
        background: var(--gray-700);
      }
    }

    // .button__success
    &__success {
      background: var(--success-600);
      color: var(--white);
      border-color: var(--success-600);

      &.button_soft {
        background: var(--success-100);
        color: var(--success-600);
      }
      &.button_outline {
        background: var(--success-100);
        color: var(--success-600);
        border-color: var(--success-600);
      }
      &.button_no-border {
        background: transparent;
        color: var(--success-600);
        border-color: transparent;
      }
      &:hover {
        color: var(--white);
        border-color: var(--success-700);
        background: var(--success-700);
      }
    }

    // .button__danger
    &__danger {
      background: var(--danger-600);
      color: var(--white);
      border-color: var(--danger-600);

      &.button_soft {
        background: var(--danger-100);
        color: var(--danger-600);
        border-color: transparent;
      }
      &.button_outline {
        background: var(--danger-100);
        color: var(--danger-600);
        border-color: var(--danger-600);
      }
      &.button_no-border {
        background: transparent;
        color: var(--danger-600);
        border: transparent;
      }
      &:hover {
        background: var(--danger-700);
        color: var(--white);
        border-color: var(--danger-700);
      }
    }

    // .button__warning
    &__warning {
      background: var(--warning-600);
      color: var(--white);
      border-color: var(--warning-600);

      &.button_soft {
        background: var(--warning-100);
        color: var(--warning-600);
      }
      &.button_outline {
        background: transparent;
        color: var(--warning-600);
        border-color: var(--warning-600);
      }
      &.button_no-border {
        background: transparent;
        color: var(--warning-600);
        border-color: transparent;
      }
      &:hover {
        color: var(--white);
        border-color: var(--warning-700);
        background: var(--warning-700);
      }
    }

    // .button__info
    &__info {
      background: var(--info-600);
      color: var(--white);
      &:hover {
        background: var(--info-700);
      }
      &.button_soft {
        background: var(--info-100);
        color: var(--info-600);
      }
      &.button_outline {
        background: var(--info-100);
        color: var(--info-600);
        border-color: var(--info-600);
      }
      &.button_no-border {
        background: transparent;
        color: var(--info-600);
        border: transparent;
      }
    }

    // .button__light
    &__light {
      background: transparent;
      color: var(--gray-700);
      &:hover {
        color: var(--gray-900);
      }
      &.button_soft {
        background: transparent;
        color: var(--gray-600);
      }
      &.button_outline {
        color: var(--gray-600);
        border: 1px solid var(--gray-600);
      }
      &.button_no-border {
        color: var(--gray-600);
        border: 1px solid transparent;
      }
    }
    // .button__dark
    &__dark {
      background: var(--gray-800);
      color: var(--white);
      border-color: var(--gray-800);
      &.button_soft {
        background: var(--gray-600);
        color: var(--gray-800);
      }
      &.button_outline {
        background: var(--gray-100);
        color: var(--gray-800);
        border-color: var(--gray-800);
      }
      &.button_no-border {
        background: transparent;
        color: var(--gray-800);
        border-color: transparent;
      }
      &:hover {
        background: var(--gray-900);
        color: var(--white);
        border-color: var(--gray-900);
      }
    }
  }
</style>

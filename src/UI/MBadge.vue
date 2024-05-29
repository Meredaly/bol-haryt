<template>
  <div :class="classes">
    <span v-if="props.icon" class="badges__icon-left">
      <m-icons :name="props.icon" />
    </span>
    <span v-if="props.title" class="badges__content">
      {{ props.title }}
    </span>
    <span v-if="props.rightIcon" class="badges__icon-right">
      <m-icons :name="props.rightIcon" />
    </span>
  </div>
</template>

<script setup>
  import { computed } from 'vue'
  import MIcons from '@/UI/MIcons.vue'

  const props = defineProps({
    title: { type: String, default: null },
    icon: { type: String, default: null },
    rightIcon: { type: String, default: null },
    styles: { type: String, default: 'primary' },
    outline: { type: Boolean, default: false },
    block: { type: Boolean, default: false },
    soft: { type: Boolean, default: false }
  })
  const classes = computed(() => [
    'badges',
    `badges__${props.styles}`,
    {
      badges_outline: props.outline,
      badges_soft: props.soft
    }
  ])
</script>

<style lang="scss" scoped>
  .badges {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px 6px;
    border-radius: 20px;
    height: fit-content;
    border: 1px solid transparent;
    width: fit-content;
    // .badges__icon-left
    &__icon-left {
      display: flex;
      :deep(.icon) {
        display: flex;
        svg {
          width: 12px;
          height: 12px;
        }
      }
    }
    .badges__icon-left + .badges__content {
      padding-left: 3px;
    }
    // .badges__content
    &__content {
      font-weight: 400;
      font-size: 12px;
      line-height: 14px;
      color: inherit;
    }
    .badges__content + .badges__icon-right {
      padding-left: 3px;
    }
    // .badges__icon-right
    &__icon-right {
      display: flex;
      :deep(.icon) {
        display: flex;
        svg {
          width: 12px;
          height: 12px;
        }
      }
    }
    // .badges_block
    &_block {
      width: 100%;
    }
    // .badges__primary
    &__primary {
      background: var(--primary-600);
      border: 1px solid var(--primary-600);
      color: var(--white);
      &.badges_soft {
        background: var(--primary-100);
        color: var(--primary-600);
        border: 1px solid var(--primary-100);
      }
      &.badges_outline {
        background: var(--white);
        color: var(--primary-600);
        border: 1px solid var(--primary-600);
      }
    }

    // .badges__secondary
    &__secondary {
      background: var(--gray-600);
      color: var(--white);
      border: 1px solid var(--gray-600);
      &.badges_soft {
        background: var(--gray-100);
        color: var(--gray-700);
        border: 1px solid var(--gray-100);
      }
      &.badges_outline {
        background: var(--white);
        color: var(--gray-700);
        border: 1px solid var(--gray-700);
      }
    }

    // .badges__success
    &__success {
      background: var(--success-500);
      color: var(--white);
      &.badges_soft {
        background: var(--success-100);
        color: var(--success-600);
        border: 1px solid var(--success-100);
      }
      &.badges_outline {
        background: var(--white);
        color: var(--success-600);
        border: 1px solid var(--success-600);
      }
    }

    // .badges__danger
    &__danger {
      background: var(--danger-600);
      color: var(--white);
      border: 1px solid var(--danger-600);
      &.badges_soft {
        background: var(--danger-100);
        color: var(--danger-600);
        border: 1px solid var(--danger-100);
      }
      &.badges_outline {
        background: var(--white);
        color: var(--danger-600);
        border: 1px solid var(--danger-600);
      }
    }

    // .badges__warning
    &__warning {
      background: var(--warning-600);
      color: var(--white);
      border: 1px solid var(--warning-600);
      &.badges_soft {
        background: var(--warning-100);
        color: var(--warning-600);
        border: 1px solid var(--warning-100);
      }
      &.badges_outline {
        background: var(--white);
        color: var(--warning-600);
        border: 1px solid var(--warning-600);
      }
    }

    // .badges__info
    &__info {
      background: var(--info-600);
      color: var(--white);
      border: 1px solid var(--info-600);
      &.badges_soft {
        background: var(--info-100);
        color: var(--info-600);
        border: 1px solid var(--info-100);
      }
      &.badges_outline {
        background: var(--white);
        color: var(--info-600);
        border: 1px solid var(--info-600);
      }
    }

    // .badges__light
    &__light {
      background: var(--gray-100);
      color: var(--gray-700);
      border: 1px solid var(--gray-100);
      &.badges_soft {
        background: var(--gray-100);
        color: var(--gray-600);
        border: 1px solid var(--gray-100);
      }
      &.badges_outline {
        background: var(--white);
        color: var(--gray-600);
        border: 1px solid var(--gray-600);
      }
    }
    // .badges__dark
    &__dark {
      background: var(--gray-800);
      color: var(--white);
      border: 1px solid var(--gray-800);
      &.badges_soft {
        background: var(--gray-600);
        color: var(--gray-800);
        border: 1px solid var(--gray-600);
      }
      &.badges_outline {
        background: var(--white);
        color: var(--gray-800);
        border: 1px solid var(--gray-800);
      }
    }
  }
</style>

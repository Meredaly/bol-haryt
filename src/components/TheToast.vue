<script setup>
  import MIcons from '@/UI/MIcons.vue'
  import { useToast } from '@/store/toast'
  const toast = useToast()
</script>
<template>
  <Teleport to="#toast">
    <template v-for="toastItem of toast.getToasts" :key="toastItem.id">
      <div class="toast__box">
        <div
          :class="[
            'toast__item',
            {
              'toast__item--warning': toastItem.status === 'warning',
              'toast__item--error': toastItem.status === 'error'
            }
          ]"
        >
          <m-icons class="toast__icon" :name="toastItem.status === 'error' ? 'danger' : toastItem.status === 'warning' ? 'warning' : 'success'" />
          <div class="toast__text">{{ toastItem.text }}</div>
        </div>
      </div>
    </template>
  </Teleport>
</template>

<style lang="scss" scoped>
  .toast {
    // .toast__box
    &__box {
      animation: 0.3s toLeft forwards ease-out;
    }
    // .toast__item
    &__item {
      background: var(--primary);
      border-radius: 10px;
      padding: 20px 30px;
      display: flex;
      gap: 10px;
      align-items: center;
      max-width: 300px;
      min-width: 220px;
      color: var(--gra-900);
      margin-bottom: 6px;
      background-color: var(--success-100);
      border: 1px solid var(--success-600);
      &--warning {
        background-color: var(--warning-100);
        border-color: var(--warning-700);

        .toast__icon {
          color: var(--warning-700);
        }
      }
      &--error {
        background-color: var(--danger-100);
        border-color: var(--danger-700);
        .toast__icon {
          color: var(--danger-700);
        }
      }
    }
    // .toast__text
    &__text {
      font-size: 16px;
      line-height: 24px;
    }
    // .toast__icon
    &__icon {
      color: var(--success-700);
    }
  }
  @keyframes toLeft {
    0% {
      transform: translateX(100%);
    }
    90% {
      transform: translateX(-10px);
    }
    100% {
      transform: translateX(0);
    }
  }
</style>

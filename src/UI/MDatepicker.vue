<script setup>
  import { computed, ref, onMounted } from 'vue'
  import MCalendar from '@/UI/MCalendar.vue'
  import MTextFiled from '@/UI/MTextFiled.vue'

  const props = defineProps({
    label: { type: String, default: null },
    message: { type: String, default: null },
    success: { type: Boolean, default: false },
    error: { type: Boolean, default: false },
    modelValue: { default: null },
    value: { default: null },
    disabled: { type: Boolean, default: false },
    width: { type: String, default: null },
    readonly: { type: Boolean, default: false },
    top: { type: Boolean, default: false },
    right: { type: Boolean, default: false },
    mini: { type: Boolean, default: false }
  })

  const emit = defineEmits(['update:modelValue', 'selectDate'])
  const showCalendar = ref(false)
  const toggleCalendar = () => {
    showCalendar.value = !showCalendar.value
  }
  const selectDate = (date) => {
    let newDate = date
      ? `${new Date(date).getFullYear().toString().padStart(4, '0')}-${(new Date(date).getMonth() + 1).toString().padStart(2, '0')}-${new Date(date)
          .getDate()
          .toString()
          .padStart(2, '0')}`
      : null
    emit('update:modelValue', newDate)
    emit('selectDate', newDate)
    showCalendar.value = false
  }
  const computedDate = computed(() => {
    let value = props.modelValue || props.value
    return value
      ? `${new Date(value).getDate().toString().padStart(2, '0')}.${(new Date(value).getMonth() + 1).toString().padStart(2, '0')}.${new Date(value)
          .getFullYear()
          .toString()
          .padStart(4, '0')}`
      : null
  })

  const datepicker = ref(null)
  onMounted(() => {
    document.addEventListener('click', (event) => {
      const isClickInside = datepicker.value?.contains(event.target)
      if (!isClickInside) {
        showCalendar.value = false
      }
    })
  })
</script>

<template>
  <div class="datepicker" ref="datepicker">
    <div class="datepicker__button">
      <m-text-filed
        @click:input="toggleCalendar"
        v-model="computedDate"
        :label="props.label"
        :disabled="props.disabled"
        :error="props.error"
        :success="props.success"
        :message="props.message"
        :width="props.width"
        placeholder="__.__.____"
        append-icon="calendar"
        type="button"
        background
        :readonly="props.readonly"
      />
    </div>
    <div
      :class="[
        'datepicker__calendar',
        {
          top: props.top,
          right: props.right
        }
      ]"
    >
      <m-calendar :date="props.modelValue ? new Date(props.modelValue) : null" v-if="showCalendar" @set-calendar-day="selectDate" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .datepicker {
    position: relative;
    // .datepicker__button
    &__button {
    }
    // .datepicker__calendar
    &__calendar {
      position: absolute;
      top: calc(100% + 10px);
      z-index: 3;
      &.top {
        top: auto;
        bottom: calc(100% - 15px);
      }
      &.right {
        right: 0;
      }
    }
  }
</style>

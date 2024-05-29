<script setup>
  import { ref, computed } from 'vue'
  import MIcons from '@/UI/MIcons.vue'

  const emit = defineEmits(['click:prevent', 'click:append', 'update:modelValue', 'click:input', 'value', 'updateValue'])

  const props = defineProps({
    prependIcon: { type: String, default: null },
    appendIcon: { type: String, default: null },
    background: { type: Boolean, default: false },
    placeholder: { type: String, default: '' },
    label: { type: String, default: null },
    message: { type: String, default: 'Error' },
    type: { type: String, default: 'text' },
    success: { type: Boolean, default: false },
    error: { type: Boolean, default: false },
    modelValue: { type: [String, Number], default: null },
    clickablePrevent: { type: Boolean, default: false },
    clickableAppend: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    width: { type: String, default: null },
    focused: { type: Boolean, default: false },
    required: { type: Boolean, default: false },
    value: { type: [String, Number], default: null },
    innerLabel: { type: String, default: null }
  })

  const showMessage = ref(false)
  const focused = ref(false)
  const classes = computed(() => [
    'input',
    {
      'input--prepend-icon': props.prependIcon,
      'input--append-icon': props.appendIcon,
      'input--success': props.success,
      'input--error': props.error,
      'input--readonly': props.readonly,
      'input--required': props.required,
      'input--background': props.background,
      'input--disabled': props.disabled,
      'input--focused': focused.value || props.focused
    }
  ])
  const update = (newValue) => {
    if (props.type === 'number') {
      emit('update:modelValue', Number(newValue))
      emit('value', Number(newValue))
      emit('updateValue', Number(newValue))
    } else {
      emit('update:modelValue', newValue)
      emit('value', newValue)
      emit('updateValue', newValue)
    }
  }
</script>

<template>
  <div
    :class="classes"
    :style="{
      width: props.width ? `${props.width}px` : null
    }"
  >
    <div v-if="props.label" class="input__label">{{ props.label }}</div>
    <div class="input__body">
      <div
        v-if="props.prependIcon"
        @click="$emit('click:prevent')"
        :class="['input__prepend-icon', { 'input__prepend-icon--clickable': props.clickablePrevent }]"
      >
        <MIcons :name="props.prependIcon" />
      </div>
      <div class="input__input">
        <input
          :type="props.type"
          :placeholder="props.placeholder"
          :value="props.modelValue || props.value"
          :disabled="props.disabled"
          @click="$emit('click:input')"
          @focus="focused = true"
          @blur="focused = false"
          @input="(event) => update(event.target.value)"
        />
        <span v-if="props.type === 'button' && props.placeholder && !props.modelValue" class="input_placeholder">{{ props.placeholder }}</span>
        <span v-if="props.innerLabel" class="input__inner-label">{{ props.innerLabel }}</span>
      </div>
      <div
        v-if="props.appendIcon"
        @click="$emit('click:append')"
        :class="['input__append-icon', { 'input__append-icon--clickable': props.clickableAppend }]"
      >
        <MIcons :name="props.appendIcon" />
      </div>
    </div>
    <div v-if="showMessage" class="input__message">{{ props.message }}</div>
  </div>
</template>

<style lang="scss" scoped>
  .input {
    width: 100%;
    // .input__label
    &__label {
      font-weight: 500;
      font-size: 12px;
      line-height: 14px;
      color: var(--gray-800);
      padding-bottom: 4px;
    }
    // .input__body
    &__body {
      width: 100%;
      border: 1px solid var(--gray-700);
      border-radius: var(--button-radius);
      background-color: transparent;
      position: relative;
    }

    &--required {
      .input__label {
        &:after {
          content: '*';
          padding-left: 2px;
          color: var(--danger-600);
        }
      }
    }

    &--background {
      .input__body {
        background-color: var(--input_background);
        border-color: var(--input_background);
      }
    }
    // .input__prepend-icon
    &__prepend-icon {
      position: absolute;
      top: 50%;
      left: 10px;
      transform: translateY(-50%);
      pointer-events: none;
      color: var(--gray-700);
      :deep(i) {
        font-size: 20px;
      }
    }

    // .input__append-icon
    &__append-icon {
      position: absolute;
      top: 50%;
      right: 10px;
      transform: translateY(-50%);
      pointer-events: none;
      color: var(--gray-700);
      :deep(i) {
        font-size: 20px;
      }
    }
    // .input__input
    &__input {
      width: 100%;
      display: flex;
      align-items: center;
      input {
        width: 100%;
        padding: 11px 19px;
        background-color: transparent;
        font-size: 14px;
        line-height: 16px;
        color: var(--gray-800);
        flex: 1 1;
        text-align: left;
        &::placeholder,
        .placeholder {
          color: var(--gray-600);
        }
        &[type='submit'],
        &[type='button'] {
          cursor: pointer;
        }
        &[type='number'] {
          -moz-appearance: textfield;
        }
        &::-webkit-outer-spin-button,
        &::-webkit-inner-spin-button {
          -webkit-appearance: none;
        }
      }
    }
    &_placeholder {
      font-size: 14px;
      line-height: 16px;
      color: var(--gray-600);
      user-select: none;
      pointer-events: none;
      padding: 11px 19px;
      position: absolute;
      left: 0;
    }

    // .input__message
    &__message {
      font-weight: 400;
      font-size: 12px;
      line-height: 15px;
      letter-spacing: 0.4px;
      padding-top: 4px;
    }
    &__prepend-icon-clickable,
    &__append-icon-clickable {
      cursor: pointer;
      pointer-events: all;
    }
    &--prepend-icon {
      .input__input {
        input {
          padding-left: 33px;
        }
      }
    }

    &--append-icon {
      .input__input {
        input,
        button {
          padding-right: 33px;
        }
      }
    }
    &--focused {
      .input__body {
        border-color: var(--primary-600);
      }
    }

    &--success {
      .input__label {
      }
      .input__body {
        border-color: var(--success-600);
      }
      .input__prepend-icon {
      }
      .input__append-icon {
      }
      .input__message {
      }
    }

    &--error {
      animation: 0.2s invalid forwards;
      .input__label {
      }
      .input__body {
        border-color: var(--danger-600);
      }
      .input__prepend-icon {
      }
      .input__append-icon {
      }
      .input__message {
      }
    }

    &__append-icon--clickable {
      pointer-events: all;
      cursor: pointer;
    }

    &__inner-label {
      color: var(--primary-600);
      font-weight: 500;
      font-size: 14px;
      line-height: 16px;
      padding-right: 10px;
    }

    &--disabled {
      .input__label {
      }
      .input__body {
        background-color: transparent;
        border-color: var(--gray-100);
      }
      .input__input {
        input,
        button {
          cursor: not-allowed;
          pointer-events: all !important;
        }
      }
      .input__prepend-icon {
        color: var(--white);
      }
      .input__append-icon {
        color: var(--white);
      }
      .input__message {
        color: var(--white);
      }
    }
  }

  @keyframes invalid {
    0% {
      transform: translateX(0px);
    }
    25% {
      transform: translateX(5px);
    }
    50% {
      transform: translateX(0px);
    }
    75% {
      transform: translateX(-5px);
    }
    100% {
      transform: translateX(0px);
    }
  }
</style>

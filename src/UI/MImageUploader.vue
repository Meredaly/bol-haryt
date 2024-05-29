<script setup>
  import { ref, computed, watchEffect } from 'vue'
  import { useI18n } from 'vue-i18n'

  import MIcons from '@/UI/MIcons.vue'

  const emit = defineEmits(['changeFile'])

  const props = defineProps({
    imagePath: { type: [String, File], default: null },
    preview: { type: Boolean, default: true },
    circle: { type: Boolean, default: false },
    title: { type: String, default: 'clickToUploadPhoto' },
    multiple: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    error: { type: Boolean, default: false },
    accept: { type: String, default: null }
  })

  const prevImage = ref(props.imagePath || null)
  const image = ref(null)
  const changeFile = (files) => {
    if (files) {
      emit('changeFile', files)
      if (props.preview) {
        prevImage.value = URL.createObjectURL(files[0])
      }
    }
    image.value.value = ''
  }
  watchEffect(() => {
    if (typeof props.imagePath === 'string') {
      prevImage.value = props.imagePath
    }
  })
  const classes = computed(() => {
    return ['image-uploader', { _circle: props.circle, 'image-uploader_error': props.error }]
  })
</script>

<template>
  <div :class="classes">
    <div class="image-uploader__preview">
      <img v-if="prevImage" :src="prevImage" />
    </div>
    <label class="image-uploader__uploader">
      <div class="image-uploader__icon">
        <m-icons name="imageAdd" />
      </div>
      <div class="image-uploader__text">{{ title }}</div>
      <input
        type="file"
        @change="(e) => changeFile(e.target.files)"
        :multiple="multiple"
        :accept="accept"
        ref="image"
        :disabled="disabled"
      />
    </label>
  </div>
</template>

<style lang="scss" scoped>
  .image-uploader {
    width: 100%;
    background: var(--gray-100);
    border-radius: var(--button-radius);
    position: relative;
    padding-top: 100%;

    &:hover {
      .image-uploader__preview {
        z-index: 0;
      }
      .image-uploader__uploader {
        z-index: 1;
      }
    }
    // .image-uploader__preview
    &__preview {
      width: 100%;
      height: 100%;
      z-index: 1;
      position: relative;
      border-radius: var(--button-radius);
      overflow: hidden;
      position: absolute;
      top: 0;
      left: 0;
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center;
      }
    }
    // .image-uploader__uploader
    &__uploader {
      border: 1px dashed var(--primary-600);
      border-radius: var(--button-radius);
      position: absolute;
      z-index: 0;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      color: var(--primary-600);
      input {
        display: none;
      }
      user-select: none;
    }
    // .image-uploader__icon
    &__icon {
      font-size: 48px;
    }
    // .image-uploader__text
    &__text {
      padding: 4px;
      text-align: center;
    }
    &._circle {
      border-radius: 50%;
      .image-uploader__preview,
      .image-uploader__uploader {
        border-radius: 50%;
      }
    }
    &_error {
      .image-uploader__uploader {
        border-color: var(--danger-600);
        color: var(--danger-600);
      }
    }
  }
</style>

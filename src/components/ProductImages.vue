<script setup>
  import { ref, watchEffect, computed } from 'vue'
  import MImageUploader from '@/UI/MImageUploader.vue'
  import MButton from '@/UI/MButton.vue'
  import MImage from '@/UI/MImage.vue'

  const emit = defineEmits(['select', 'delete'])

  const props = defineProps({
    images: { type: Array, default: () => [] },
    disabled: { type: Boolean, default: false },
    error: { type: Boolean, default: false }
  })
  const mainImage = ref(null)

  const selectImages = (files) => {
    if (files) {
      emit('select', files)
    }
  }

  const selectMainImage = (image) => {
    mainImage.value = image
  }

  const deleteImage = (index) => {
    emit('delete', index)
  }
  watchEffect(() => {
    if (props.images.length && !mainImage.value) {
      mainImage.value = props.images[0]
    }
    if (!props.images.includes(mainImage.value)) {
      mainImage.value = props.images[0] || null
    }
  })

  const classes = computed(() => {
    return [
      'product__images',
      {
        product_error: props.error
      }
    ]
  })
</script>

<template>
  <div :class="classes">
    <div class="product__images-main">
      <m-image :image="mainImage" />
    </div>
    <div class="product__images-others">
      <div class="product__images-image">
        <m-image-uploader @change-file="selectImages" :preview="false" title="" :disabled="disabled" :error="error" multiple accept="image/*" />
      </div>
      <div v-for="(image, index) in images" :key="image.id" class="product__images-image">
        <div v-if="!disabled" @click="deleteImage(index)" class="product__images-delete">
          <m-button icon="delete" styles="danger" outline only-icon />
        </div>
        <m-image @click="selectMainImage(image)" :image="image" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .product {
    height: 100%;
    overflow: auto;
    &__images {
    }
    // .product__images-main
    &__images-main {
      width: 100%;
      :deep() {
        .image {
          width: 100%;
          padding-top: 100%;
          position: relative;
          .image__box {
            position: absolute;
            top: 0;
            left: 0;
          }

          img {
            object-fit: contain;
          }
        }
      }
    }
    // .product__images-others
    &__images-others {
      display: flex;
      gap: 10px;
      width: 100%;
      overflow-x: auto;
      margin-top: 20px;
    }
    // .product__images-image
    &__images-image {
      position: relative;
      .image-uploader {
        width: 80px;
      }
      :deep() {
        .image {
          width: 80px;
          height: 80px;

          img {
            object-fit: contain;
          }
        }
      }
      &:hover {
        .product__images-delete {
          display: block;
        }
      }
    }
    // .product__images-delete
    &__images-delete {
      position: absolute;
      z-index: 1;
      top: 5px;
      right: 5px;
      display: none;
    }
    // product_error
    &_error {
      .product__images-main {
        border: 1px solid var(--danger-600);
        border-radius: var(--button-radius);
        overflow: hidden;
        animation: 0.2s invalid forwards;
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
  }
</style>

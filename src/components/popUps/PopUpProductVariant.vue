<script setup>
  import { ref, computed } from 'vue'
  import MPopUpBody from '@/UI/MPopUpBody.vue'
  import MRow from '@/UI/MRow.vue'
  import MCol from '@/UI/MCol.vue'
  import MButton from '@/UI/MButton.vue'
  import MImage from '@/UI/MImage.vue'
  import MTextFiled from '@/UI/MTextFiled.vue'

  import { GET_PRODUCT_VARIANT } from '@/api/product.api'

  import { useValidators } from '@/helpers/validators'
  import { useToast } from '@/store/toast'

  const emit = defineEmits(['close', 'save'])

  const props = defineProps({
    variantId: { type: Number, default: null },
    loading: { type: Boolean, default: false }
  })

  const toast = useToast()
  const { required, optional } = useValidators()

  const variant = ref({
    id: 0,
    image: '',
    name: '',
    code: '',
    price: 0,
    old_price: 0,
    discount: 0,
    count: 0,
    fee: 0,
    order: 0
  })

  const getProductVariant = async () => {
    try {
      const { data } = await GET_PRODUCT_VARIANT({ id: props.variantId })
      variant.value = {
        id: data.id,
        image: data.image,
        name: data.product?.name,
        code: data.code,
        price: Number(data.old_price || data.price),
        old_price: Number(data.old_price ? data.price : data.old_price),
        discount: data.discount,
        sale_price: data.sale_price,
        fee: data.fee,
        count: data.count,
        order: data.order
      }
    } catch (error) {
      console.error(error)
    }
  }

  const close = () => {
    emit('close')
  }

  const error = ref(false)
  const checkValidation = () => {
    if (required(variant.value.code) && required(variant.value.price)) {
      error.value = false
      return true
    } else {
      error.value = false
      setTimeout(() => {
        toast.addToast({
          text: 'Заполните все поля',
          status: 'warning'
        })
        error.value = true
      }, 0)
      return false
    }
  }

  const save = () => {
    if (!checkValidation()) {
      return
    }
    emit('save', variant.value)
  }
  if (props.variantId) {
    getProductVariant()
  }

  const updatePrice = () => {
    updateOldPrice()
  }

  const updateOldPrice = () => {
    const present = variant.value?.price ? variant.value.price / 100 : 0
    const betweenPrice = variant.value.price - variant.value.old_price

    let discount = variant.value?.old_price ? Math.round(betweenPrice / present) : 0
    variant.value.discount = discount < 0 ? 0 : discount
  }

  const updateDiscount = () => {
    const present = variant.value.price / 100
    let oldPrice = Math.round(variant.value.price - present * variant.value.discount)
    variant.value.old_price = variant.value.discount > 0 ? oldPrice : 0
  }

  const computedTotalPrice = computed(() => {
    const currentPrice = variant.value.old_price || variant.value.price
    const percentCount = Math.round((currentPrice / 100) * variant.value.fee)
    return currentPrice - percentCount
  })
</script>

<template>
  <m-pop-up-body width="900" title="Товар" @close="close">
    <m-row>
      <m-col class="image" cols="4">
        <m-image :image="variant.image" />
      </m-col>
      <m-col cols="8">
        <m-row>
          <m-col cols="12">
            <m-text-filed v-model="variant.name" label="Имя" disabled background />
          </m-col>
          <m-col cols="12">
            <div class="space"></div>
          </m-col>
          <m-col cols="3">
            <m-text-filed
              @updateValue="updatePrice"
              v-model="variant.price"
              :disabled="loading"
              :error="error && optional(variant.price)"
              label="Цена"
              inner-label="TMT"
              background
              type="number"
              required
            />
          </m-col>
          <m-col cols="3">
            <m-text-filed
              @updateValue="updateOldPrice"
              v-model="variant.old_price"
              :disabled="loading"
              label="Цена со скидкой"
              inner-label="TMT"
              type="number"
              background
            />
          </m-col>
          <m-col cols="3">
            <m-text-filed
              @updateValue="updateDiscount"
              v-model="variant.discount"
              :disabled="loading"
              label="Скидка в процентах"
              inner-label="%"
              background
              type="number"
            />
          </m-col>
          <m-col cols="3">
            <m-text-filed v-model="variant.count" :disabled="loading" label="Количество товаров" background type="number" />
          </m-col>
          <m-col cols="3">
            <m-text-filed v-model="variant.fee" disabled label="Комисия" background inner-label="%" />
          </m-col>
          <m-col cols="3">
            <m-text-filed v-model="computedTotalPrice" label="Итоговая цена" background disabled inner-label="TMT" />
          </m-col>
          <m-col cols="6">
            <m-text-filed
              v-model.trim="variant.code"
              :disabled="loading"
              :error="error && optional(variant.code)"
              label="Баркод"
              background
              required
            />
          </m-col>
        </m-row>
      </m-col>
    </m-row>
    <template v-slot:bot>
      <div class="flex flex-x-end gap-10">
        <m-button @click="close" :disabled="loading" title="Отмена" styles="secondary" />
        <m-button @click="save" :disabled="loading" :loading="loading" title="Сохранить" />
      </div>
    </template>
  </m-pop-up-body>
</template>

<style lang="scss" scoped>
  .image {
    height: 277px;
  }
  .space {
    height: 30px;
  }
</style>

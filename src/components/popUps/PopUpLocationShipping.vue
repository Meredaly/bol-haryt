<script setup>
  import { ref, watchEffect } from 'vue'
  import { useI18n } from 'vue-i18n'

  import MPopUpBody from '@/UI/MPopUpBody.vue'
  import MRow from '@/UI/MRow.vue'
  import MCol from '@/UI/MCol.vue'
  import MButton from '@/UI/MButton.vue'
  import MTextFiled from '@/UI/MTextFiled.vue'
  import MDivider from '@/UI/MDivider.vue'
  import MDropdown from '@/UI/MDropdown'
  import MDropdownSelect from '@/UI/MDropdownSelect'

  import { GET_SHIPPINGS } from '@/api/shipping.api'
  import { GET_PAYMENT_METHODS } from '@/api/payment-methods.api'

  import { updateCategoryForDropdown } from '@/helpers/normalize'

  import { useValidators } from '@/helpers/validators'
  import { useToast } from '@/store/toast'

  const emit = defineEmits(['close', 'save'])

  const props = defineProps({
    shippings: { type: Object, default: null },
    parentId: { type: [Number, String], default: '' },
    loading: { type: Boolean, default: false }
  })

  const toast = useToast()
  const { required, optional } = useValidators()
  const { t, locale } = useI18n()

  const form = ref({
    name_tm: '',
    name_ru: '',
    shipping: [],
    payment_methods: []
  })

  const paymentMethods = ref([])
  const getPaymentMethods = async () => {
    try {
      const { data } = await GET_PAYMENT_METHODS({ params: { lang: 'all' } })
      paymentMethods.value = updateCategoryForDropdown(data, '', locale.value) || []
    } catch (error) {
      console.error(error)
    }
  }
  getPaymentMethods()

  const selectedPaymentMethods = ref([])
  const selectPaymentMethod = (paymentMethod) => {
    const findPaymentMethod = selectedPaymentMethods.value.findIndex((tagItem) => tagItem.id === paymentMethod.id)
    if (findPaymentMethod >= 0) {
      selectedPaymentMethods.value.splice(findPaymentMethod, 1)
      form.value.payment_methods.splice(findPaymentMethod, 1)
    } else {
      selectedPaymentMethods.value.push({
        id: paymentMethod.id,
        name: paymentMethod.name
      })
      form.value.payment_methods.push(paymentMethod.id)
    }
  }

  const shippings = ref([])
  const getShippings = async () => {
    try {
      const { data } = await GET_SHIPPINGS({ params: {} })

      shippings.value = updateCategoryForDropdown(data, '', locale.value) || []
    } catch (error) {
      console.error(error)
    }
  }
  getShippings()

  const selectShipping = (shipping, index) => {
    form.value.shipping[index].shipping = shipping
  }

  const addShipping = () => {
    form.value.shipping.push({
      shipping: null,
      shipping_time: 0,
      shipping_price: 0
    })
  }

  const deleteItems = ref([])
  const deleteItem = (index) => {
    if (form.value.shipping[index].id) {
      deleteItems.value.push({
        method: 'delete',
        id: form.value.shipping[index].id
      })
    }
    form.value.shipping.splice(index, 1)
  }

  const close = () => {
    emit('close')
  }

  const error = ref(false)
  const checkValidation = () => {
    const isShipping =
      form.value.shipping.every((shipping) => {
        return required(shipping.shipping?.id)
      }) || false

    if (
      required(form.value.name_tm) &&
      required(form.value.name_ru) &&
      required(form.value.payment_methods.length) &&
      isShipping
    ) {
      error.value = false
      return true
    } else {
      error.value = false
      setTimeout(() => {
        toast.addToast({
          text: `${t('fillAllFields')}`,
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

    const newForm = {
      name_tm: form.value.name_tm,
      name_ru: form.value.name_ru,
      parent: props.parentId,
      payment_methods: form.value.payment_methods
    }
    if (props.shippings?.id) {
      newForm.sort_order = form.value.sort_order
      newForm.parent = form.value.parent
      newForm.shipping = form.value.shipping.map((shipping) => {
        if (shipping.id) {
          return {
            id: shipping.id,
            shipping_id: shipping.shipping?.id || null,
            shipping_time: shipping.shipping_time,
            shipping_price: shipping.shipping_price
          }
        } else {
          return {
            shipping_id: shipping.shipping?.id || null,
            shipping_time: shipping.shipping_time,
            shipping_price: shipping.shipping_price
          }
        }
      })
      newForm.shipping.push(...deleteItems.value)
    } else {
      newForm.shipping = form.value.shipping.map((shipping) => {
        return {
          shipping_id: shipping.shipping?.id || null,
          shipping_time: shipping.shipping_time,
          shipping_price: shipping.shipping_price
        }
      })
    }
    emit('save', { id: props.shippings?.id, form: newForm })
  }

  watchEffect(() => {
    if (props.shippings) {
      form.value = {
        name_tm: props.shippings.name.tm,
        name_ru: props.shippings.name.ru,
        parent: props.shippings.parent_id,
        sort_order: props.shippings.sort_order,
        payment_methods: props.shippings.payment_methods?.map((paymentMethod) => paymentMethod.id) || []
      }
      form.value.shipping = props.shippings.shipping?.map((shipping) => {
        return {
          shipping: {
            id: shipping.shipping_id,
            name: shipping.shipping.ru
          },
          id: shipping.id,
          shipping_id: shipping.shipping_id.id,
          shipping_time: shipping.shipping_time,
          shipping_price: shipping.shipping_price
        }
      })
      selectedPaymentMethods.value = updateCategoryForDropdown(props.shippings.payment_methods) || []
    }
  })
</script>

<template>
  <m-pop-up-body width="900" :title="t('location')" @close="close">
    <m-row>
      <m-col cols="6">
        <m-text-filed
          v-model.trim="form.name_ru"
          :error="error && optional(form.name_ru)"
          :disabled="loading"
          required
          :label="`${t('title')} RU`"
          background
        />
      </m-col>
      <m-col cols="6">
        <m-text-filed
          v-model.trim="form.name_tm"
          :error="error && optional(form.name_tm)"
          :disabled="loading"
          required
          :label="`${t('title')} TM`"
          background
        />
      </m-col>
      <m-col cols="12">
        <m-dropdown-select
          @select-item="selectPaymentMethod"
          :selected-items="selectedPaymentMethods"
          :items="paymentMethods"
          :error="error && optional(selectedPaymentMethods.length)"
          :disabled="loading"
          required
          :label="t('paymentMethod')"
          background
        />
      </m-col>
      <m-col cols="12">
        <m-divider />
      </m-col>
      <template v-for="(shipping, index) in form.shipping">
        <m-col cols="6">
          <m-dropdown
            @select-item="(shipping) => selectShipping(shipping, index)"
            :selected-item="shipping.shipping"
            :items="shippings"
            :error="error && optional(shipping.shipping)"
            :disabled="loading"
            required
            background
            :label="t('shipping')"
          />
        </m-col>
        <m-col cols="3">
          <m-text-filed
            v-model.trim="shipping.shipping_time"
            type="number"
            :disabled="loading"
            :label="t('shopLocales.deliveryTimeText')"
            background
            inner-label="sag"
          />
        </m-col>
        <m-col cols="3" class="flex flex-y-end gap-10">
          <m-text-filed
            v-model.trim="shipping.shipping_price"
            :disabled="loading"
            :label="t('price')"
            inner-label="TMT"
            type="number"
            background
          />
          <m-button @click="deleteItem(index)" :disabled="loading" icon="delete" styles="danger" outline />
        </m-col>
      </template>
      <m-col cols="12">
        <m-button @click="addShipping" :disabled="loading" icon="add" :title="t('add')" outline block />
      </m-col>
    </m-row>
    <template v-slot:bot>
      <div class="flex flex-x-end gap-10">
        <m-button @click="close" :disabled="loading" :title="t('cancel')" styles="secondary" />
        <m-button @click="save" :loading="loading" :disabled="loading" :title="t('save')" />
      </div>
    </template>
  </m-pop-up-body>
</template>

<style lang="scss" scoped></style>

<script setup>
  import { ref } from 'vue'
  import { useI18n } from 'vue-i18n'

  import MPopUpBody from '@/UI/MPopUpBody.vue'
  import MRow from '@/UI/MRow.vue'
  import MCol from '@/UI/MCol.vue'
  import MButton from '@/UI/MButton.vue'
  import MTextFiled from '@/UI/MTextFiled.vue'
  import MTextarea from '@/UI/MTextarea.vue'
  import MImageUploader from '@/UI/MImageUploader.vue'
  import MCheckbox from '@/UI/MCheckbox.vue'

  import { useValidators } from '@/helpers/validators'
  import { useToast } from '@/store/toast'

  const emit = defineEmits(['close', 'save'])

  const props = defineProps({
    item: { type: Object, default: null },
    loading: { type: Boolean, default: false }
  })

  const toast = useToast()
  const { required, optional } = useValidators()
  const { t } = useI18n()

  const form = ref({
    market_name: '',
    name: '',
    number: '',
    email: '',
    description_tm: '',
    description_ru: '',
    fee: 0,
    address: '',
    logo: '',
    shipping_time: 0,
    status: 1
  })

  const changeImage = (files) => {
    form.value.logo = files[0]
  }

  const updateStatus = (status) => {
    form.value.status = status ? 1 : 0
  }

  const close = () => {
    emit('close')
  }

  const error = ref(false)
  const checkValidation = () => {
    if (required(form.value.market_name) && required(form.value.name) && required(form.value.number)) {
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
    emit('save', { id: props.item?.id || null, form: form.value })
  }
  const wallet = ref(0)

  if (props.item) {
    form.value = {
      market_name: props.item.market_name,
      name: props.item.name,
      number: props.item.number,
      email: props.item.email,
      description_tm: props.item.description.tm,
      description_ru: props.item.description.ru,
      fee: props.item.fee,
      address: props.item.address,
      logo: props.item.logo,
      status: props.item.status,
      shipping_time: props.item.shipping_time
    }
    wallet.value = props.item.wallet
  }
</script>

<template>
  <m-pop-up-body width="900" :title="t('shop')" @close="close">
    <m-row>
      <m-col cols="4">
        <m-image-uploader @change-file="changeImage" :image-path="form.logo" circle />
      </m-col>
      <m-col cols="8">
        <m-row>
          <m-col cols="12">
            <m-text-filed
              v-model.trim="form.market_name"
              :error="error && optional(form.market_name)"
              :disabled="loading"
              required
              :label="t('title')"
              background
            />
          </m-col>
          <m-col cols="6">
            <m-text-filed
              v-model.trim="form.name"
              :error="error && optional(form.name)"
              :disabled="loading"
              required
              :label="t('shopLocales.owner')"
              background
            />
          </m-col>
          <m-col cols="6">
            <m-text-filed
              v-model.trim="form.number"
              :error="error && optional(form.number)"
              :disabled="loading"
              required
              :label="t('phoneNumber')"
              background
            />
          </m-col>
          <m-col cols="6">
            <m-text-filed v-model.trim="form.email" :disabled="loading" :label="t('email')" background />
          </m-col>
          <m-col cols="3">
            <m-text-filed
              v-model.trim="form.fee"
              :disabled="loading"
              :label="t('commission')"
              type="number"
              background
              inner-label="%"
            />
          </m-col>
          <m-col cols="3">
            <m-text-filed
              v-model.trim="wallet"
              disabled
              :label="t('shopLocales.wallet')"
              background
              inner-label="TMT"
            />
          </m-col>
          <m-col cols="9">
            <m-text-filed v-model.trim="form.address" :disabled="loading" :label="t('users.address')" background />
          </m-col>
          <m-col cols="3">
            <m-text-filed
              v-model.trim="form.shipping_time"
              :disabled="loading"
              :label="t('shopLocales.deliveryTimeText')"
              type="number"
              background
              inner-label="sag"
            />
          </m-col>
        </m-row>
      </m-col>
      <m-col cols="6">
        <m-textarea
          v-model.trim="form.description_ru"
          :disabled="loading"
          :label="`${t('description')} RU`"
          background
        />
      </m-col>
      <m-col cols="6">
        <m-textarea
          v-model.trim="form.description_tm"
          :disabled="loading"
          :label="`${t('description')} TM`"
          background
        />
      </m-col>
      <m-col cols="12">
        <m-checkbox @update-status="updateStatus" :value="!!form.status" :disabled="loading" :title="t('status')" />
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

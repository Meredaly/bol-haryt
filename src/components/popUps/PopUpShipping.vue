<script setup>
  import { ref } from 'vue'
  import { useI18n } from 'vue-i18n'

  import MButton from '@/UI/MButton.vue'
  import MTextFiled from '@/UI/MTextFiled.vue'
  import MRow from '@/UI/MRow.vue'
  import MCol from '@/UI/MCol.vue'
  import MPopUpBody from '@/UI/MPopUpBody.vue'

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
    name_tm: '',
    name_ru: '',
    price: 0,
    time: 0
  })

  const close = () => {
    emit('close')
  }

  const error = ref(false)
  const checkValidation = () => {
    if (required(form.value.name_tm) && required(form.value.name_ru)) {
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

  if (props.item) {
    form.value = {
      name_tm: props.item.name.tm,
      name_ru: props.item.name.ru,
      price: props.item.price,
      time: props.item.time,
      order: props.item.order
    }
  }
</script>
<template>
  <m-pop-up-body @close="close" width="600" :title="t('shippings.deliveryType')">
    <m-row row-gap="15">
      <m-col cols="12">
        <m-text-filed
          v-model.trim="form.name_ru"
          :error="error && optional(form.name_ru)"
          :disabled="loading"
          required
          :label="`${t('name')} (RU)`"
          background
        />
      </m-col>
      <m-col cols="12">
        <m-text-filed
          v-model.trim="form.name_tm"
          :error="error && optional(form.name_tm)"
          :disabled="loading"
          required
          :label="`${t('name')} (TM)`"
          background
        />
      </m-col>
      <m-col cols="6">
        <m-text-filed
          v-model="form.price"
          :disabled="loading"
          type="number"
          :label="t('price')"
          background
          inner-label="TMT"
        />
      </m-col>
      <m-col cols="6">
        <m-text-filed
          v-model="form.time"
          :disabled="loading"
          type="number"
          :label="t('shopLocales.deliveryTimeText')"
          background
          inner-label="sag"
        />
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

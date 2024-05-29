<script setup>
  import { ref } from 'vue'
  import { useI18n } from 'vue-i18n'

  import MPopUpBody from '@/UI/MPopUpBody.vue'
  import MRow from '@/UI/MRow.vue'
  import MCol from '@/UI/MCol.vue'
  import MButton from '@/UI/MButton.vue'
  import MTextFiled from '@/UI/MTextFiled.vue'
  import MImageUploader from '@/UI/MImageUploader.vue'

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
    name: '',
    logo: ''
  })

  const changeLogo = (files) => {
    form.value.logo = files[0]
  }

  const close = () => {
    emit('close')
  }

  const error = ref(false)
  const checkValidation = () => {
    if (required(form.value.name)) {
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
      name: props.item.name,
      logo: props.item.logo,
      order: props.item.order
    }
  }
</script>

<template>
  <m-pop-up-body width="600" :title="t('brand')" @close="close">
    <m-row>
      <m-col cols="4">
        <m-image-uploader :image-path="form.logo" @change-file="changeLogo" :disabled="loading" circle />
      </m-col>
      <m-col cols="8">
        <m-row>
          <m-col cols="12">
            <m-text-filed
              v-model.trim="form.name"
              :error="error && optional(form.name)"
              :disabled="loading"
              required
              :label="t('title')"
              background
            />
          </m-col>
        </m-row>
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

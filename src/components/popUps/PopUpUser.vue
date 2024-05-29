<script setup>
  import { ref } from 'vue'
  import { useI18n } from 'vue-i18n'

  import MPopUpBody from '@/UI/MPopUpBody.vue'
  import MRow from '@/UI/MRow.vue'
  import MCol from '@/UI/MCol.vue'
  import MButton from '@/UI/MButton.vue'
  import MTextFiled from '@/UI/MTextFiled.vue'
  import MTextarea from '@/UI/MTextarea.vue'

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
    number: '',
    address: '',
    status: 0
  })

  const updateStatus = (status) => {
    form.value.status = status ? 1 : 0
  }

  const error = ref(false)
  const checkValidation = () => {
    if (required(form.value.name) && required(form.value.number)) {
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

  const close = () => {
    emit('close')
  }
  const save = () => {
    if (!checkValidation()) {
      return
    }
    emit('save', { id: props.item?.id || null, form: form.value })
  }

  if (props.item) {
    form.value = {
      name: props.item.name || '',
      number: props.item.number || '',
      address: props.item.address || '',
      status: props.item.status
    }
  }
</script>

<template>
  <m-pop-up-body width="700" :title="t('user')" @close="close">
    <m-row>
      <m-col cols="8">
        <m-text-filed
          v-model.trim="form.name"
          :error="error && optional(form.name)"
          :disabled="loading"
          required
          :label="t('name')"
          background
        />
      </m-col>
      <m-col cols="4">
        <m-text-filed
          v-model.trim="form.number"
          :error="error && optional(form.number)"
          :disabled="loading"
          required
          :label="t('phoneNumber')"
          background
        />
      </m-col>
      <m-col cols="12">
        <m-textarea v-model.trim="form.address" :label="t('users.address')" background />
      </m-col>
      <m-col cols="12">
        <m-checkbox @update-status="updateStatus" :value="!!form.status" :title="t('status')" />
      </m-col>
    </m-row>
    <template v-slot:bot>
      <div class="flex flex-x-end gap-10">
        <m-button @click="close" :title="t('cancel')" styles="secondary" />
        <m-button @click="save" :title="t('save')" />
      </div>
    </template>
  </m-pop-up-body>
</template>

<style lang="scss" scoped></style>

<script setup>
  import { ref } from 'vue'
  import { useI18n } from 'vue-i18n'

  import MPopUpBody from '@/UI/MPopUpBody.vue'
  import MRow from '@/UI/MRow.vue'
  import MCol from '@/UI/MCol.vue'
  import MButton from '@/UI/MButton.vue'
  import MDropdown from '@/UI/MDropdown'
  import MTextFiled from '@/UI/MTextFiled.vue'
  import MCheckbox from '@/UI/MCheckbox.vue'

  import { useValidators } from '@/helpers/validators'
  import { useToast } from '@/store/toast'

  const emit = defineEmits(['close', 'save'])

  const props = defineProps({
    item: { type: Object, default: null },
    loading: { type: Boolean, default: false }
  })

  const toast = useToast()
  const { t } = useI18n()

  const { required, optional } = useValidators()

  const form = ref({
    name: '',
    number: '',
    email: '',
    permission: 0,
    status: 1
  })

  const permissions = ref([
    { id: 0, name: t('manager') },
    { id: 1, name: t('administrator') }
  ])

  const selectedPermission = ref(permissions.value[0])
  const selectPermission = (permission) => {
    selectedPermission.value = permission
    form.value.permission = permission.id
  }

  const updateStatus = (status) => {
    form.value.status = status ? 1 : 0
  }

  const close = () => {
    emit('close')
  }

  const error = ref(false)
  const checkValidation = () => {
    if (required(form.value.name) && required(form.value.email)) {
      error.value = false
      return true
    } else {
      error.value = false
      setTimeout(() => {
        toast.addToast({
          text: t('fillAllFields'),
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
      number: props.item.number,
      email: props.item.email,
      permission: props.item.permission,
      status: props.item.status
    }
    selectedPermission.value = permissions.value[props.item.permission]
  }
</script>

<template>
  <m-pop-up-body width="600" :title="t('personal')" @close="close">
    <m-row>
      <m-col cols="6">
        <m-text-filed
          v-model.trim="form.name"
          :error="error && optional(form.name)"
          :disabled="loading"
          required
          :label="t('name')"
          background
        />
      </m-col>
      <m-col cols="6">
        <m-text-filed
          v-model.trim="form.email"
          :error="error && optional(form.email)"
          :disabled="loading"
          required
          :label="t('email')"
          background
        />
      </m-col>
      <m-col cols="6">
        <m-text-filed v-model.trim="form.number" :disabled="loading" :label="t('phoneNumber')" background />
      </m-col>
      <m-col cols="6">
        <m-dropdown
          @select-item="selectPermission"
          :selected-item="selectedPermission"
          :items="permissions"
          :disabled="loading"
          :label="t('access')"
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
        <m-button @click="save" :disabled="loading" :loading="loading" :title="t('save')" />
      </div>
    </template>
  </m-pop-up-body>
</template>

<style lang="scss" scoped></style>

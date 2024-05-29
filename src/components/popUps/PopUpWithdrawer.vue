<script setup>
  import { ref } from 'vue'
  import { useI18n } from 'vue-i18n'

  import MPopUpBody from '@/UI/MPopUpBody.vue'
  import MRow from '@/UI/MRow.vue'
  import MCol from '@/UI/MCol.vue'
  import MButton from '@/UI/MButton.vue'
  import MTextFiled from '@/UI/MTextFiled.vue'
  import MDropdown from '@/UI/MDropdown'

  import { useValidators } from '@/helpers/validators'
  import { useToast } from '@/store/toast'
  import { useShops } from '@/composables/productShops'

  const emit = defineEmits(['close', 'save'])

  const props = defineProps({
    item: { type: Object, default: null },
    loading: { type: Boolean, default: false }
  })

  const toast = useToast()
  const { required, optional } = useValidators()
  const { t } = useI18n()

  const form = ref({
    seller: null,
    paid: 0
  })

  const { shops, getShops } = useShops()
  getShops()

  const selectedShop = ref(null)
  const selectFilterShop = (shop) => {
    form.value.seller = shop.id
    selectedShop.value = shop
  }

  const close = () => {
    emit('close')
  }

  const error = ref(false)
  const checkValidation = () => {
    if (required(form.value.seller) && required(form.value.paid)) {
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
    emit('save', { form: form.value })
  }
</script>

<template>
  <m-pop-up-body width="500" :title="t('sidebar.withdrawer')" @close="close">
    <m-row>
      <m-col cols="12">
        <m-dropdown
          @select-item="selectFilterShop"
          @search="getShops"
          :selected-item="selectedShop"
          :items="shops"
          :disabled="loading"
          :error="error && optional(form.seller)"
          background
          searchable
          required
          :label="t('shops')"
        />
      </m-col>
      <m-col cols="6">
        <m-text-filed
          :value="selectedShop?.wallet"
          :label="t('shopLocales.wallet')"
          disabled
          background
          inner-label="TMT"
        />
      </m-col>
      <m-col cols="6">
        <m-text-filed
          v-model.trim="form.paid"
          :error="error && optional(form.paid)"
          :disabled="loading"
          background
          required
          type="number"
          :label="t('withdrawer.sum')"
          inner-label="TMT"
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

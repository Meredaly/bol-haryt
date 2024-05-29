<script setup>
  import { ref } from 'vue'
  import { useI18n } from 'vue-i18n'

  import MPopUpBody from '@/UI/MPopUpBody.vue'
  import MRow from '@/UI/MRow.vue'
  import MCol from '@/UI/MCol.vue'
  import MButton from '@/UI/MButton.vue'
  import MTextFiled from '@/UI/MTextFiled.vue'
  import MTextarea from '@/UI/MTextarea.vue'
  import MDropdownSelect from '@/UI/MDropdownSelect'
  import MCheckbox from '@/UI/MCheckbox.vue'
  import { updateCategoryForDropdown } from '@/helpers/normalize'

  import { useValidators } from '@/helpers/validators'
  import { useToast } from '@/store/toast'

  import { GET_CATEGORIES } from '@/api/category.api'
  import { useCategories } from '@/composables/productCategories'

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
    description: '',
    status: 1,
    main: 0,
    category: []
  })
  const { categories, selectedCategories, getCategories, getMainCategories, selectCategory } = useCategories(form)

  const updateStatus = (status) => {
    form.value.status = status ? 1 : 0
  }

  const updateMain = (main) => {
    form.value.main = main ? 1 : 0
  }

  const close = () => {
    emit('close')
  }

  const error = ref(false)
  const checkValidation = () => {
    if (required(form.value.name_tm) && required(form.value.name_ru) && required(selectedCategories.value.length)) {
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

  const getData = async () => {
    await getMainCategories()
    await getCategories()
    if (props.item) {
      form.value = {
        name_tm: props.item.name.tm,
        name_ru: props.item.name.ru,
        description: props.item.description,
        status: props.item.status,
        category: [],
        order: props.item.order,
        main: props.item.main || 0
      }
      props.item.category?.forEach((category) => selectCategory(category))
    }
  }
  getData()
</script>

<template>
  <m-pop-up-body width="800" :title="t('characteristic')" @close="close">
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
          @select-item="selectCategory"
          @search="getCategories"
          :items="categories"
          :selected-items="selectedCategories"
          :error="error && optional(selectedCategories.length)"
          :disabled="loading"
          :label="t('categories')"
          searchable
          required
          background
        />
      </m-col>
      <m-col cols="12">
        <m-textarea v-model.trim="form.description" :disabled="loading" :label="t('description')" background />
      </m-col>
      <m-col cols="6">
        <m-checkbox @update-status="updateStatus" :value="!!form.status" :disabled="loading" :title="t('status')" />
      </m-col>
      <m-col cols="6">
        <m-checkbox @update-status="updateMain" :value="!!form.main" :disabled="loading" :title="t('basic')" />
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

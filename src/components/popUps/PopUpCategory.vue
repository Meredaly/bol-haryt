<script setup>
  import { ref } from 'vue'
  import { useI18n } from 'vue-i18n'

  import MPopUpBody from '@/UI/MPopUpBody.vue'
  import MRow from '@/UI/MRow.vue'
  import MCol from '@/UI/MCol.vue'
  import MButton from '@/UI/MButton.vue'
  import MTextFiled from '@/UI/MTextFiled.vue'
  import MImageUploader from '@/UI/MImageUploader.vue'
  import MCheckbox from '@/UI/MCheckbox.vue'
  import MDropdown from '@/UI/MDropdown'
  import { updateCategoryForDropdown } from '@/helpers/normalize'

  import { useValidators } from '@/helpers/validators'
  import { useToast } from '@/store/toast'

  const emit = defineEmits(['close', 'save'])

  const props = defineProps({
    item: { type: Object, default: null },
    parentId: { type: [Number, String], default: '' },
    categoryItems: { type: Array, default: null },
    loading: { type: Boolean, default: false }
  })

  const toast = useToast()
  const { required, optional } = useValidators()
  const { t } = useI18n()

  const form = ref({
    image: '',
    name_tm: '',
    name_ru: '',
    status: 1,
    float_price: 0,
    fee: 0,
    parent: props.parentId
  })

  const categories = ref([])
  categories.value = updateCategoryForDropdown(props.categoryItems)

  const selectedCategory = ref(null)
  const selectCategory = (category) => {
    selectedCategory.value = category
    form.value.parent = category.id
  }

  const changeImage = (files) => {
    form.value.image = files[0]
  }

  const deleteImage = () => {
    form.value.image = ''
  }
  const updateStatus = (status) => {
    form.value.status = status ? 1 : 0
  }

  const updateFloatPrice = (status) => {
    form.value.float_price = status ? 1 : 0
  }

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

  const findCategory = (categoryItems, id) => {
    for (const category of categoryItems) {
      if (category.id === id) {
        return category
      }

      if (category.sub) {
        const findItem = findCategory(category.sub, id)
        if (findItem) {
          return findItem
        }
      }
    }

    return null
  }

  if (props.item) {
    form.value = {
      image: props.item.image,
      name_tm: props.item.name.tm,
      name_ru: props.item.name.ru,
      status: props.item.status,
      float_price: props.item.float_price ? 1 : 0,
      fee: props.item.fee,
      order: props.item.order,
      parent: props.item.parent_id || ''
    }
  }
  if (props.parentId) {
    selectedCategory.value = findCategory(categories.value, props.parentId)
  }
</script>

<template>
  <m-pop-up-body width="600" :title="t('category')" @close="close">
    <m-row>
      <m-col cols="4" rows="3">
        <div class="category-image">
          <m-image-uploader @change-file="changeImage" :image-path="form.image" :disabled="loading" />
          <div v-if="form.image" class="category-image__delete">
            <m-button @click="deleteImage" :disabled="loading" icon="delete" styles="danger" outline only-icon />
          </div>
        </div>
      </m-col>
      <m-col cols="8">
        <m-text-filed
          v-model.trim="form.name_ru"
          :error="error && optional(form.name_ru)"
          :disabled="loading"
          required
          :label="`${t('title')} RU`"
          background
        />
      </m-col>
      <m-col cols="8">
        <m-text-filed
          v-model.trim="form.name_tm"
          :error="error && optional(form.name_tm)"
          :disabled="loading"
          required
          :label="`${t('title')} TM`"
          background
        />
      </m-col>
      <m-col cols="8">
        <m-dropdown
          @select-item="selectCategory"
          :selected-item="selectedCategory"
          :items="categories"
          :disabled="loading"
          :label="t('categories')"
          background
        />
      </m-col>
      <m-col cols="4">
        <m-text-filed
          v-model.trim="form.fee"
          :disabled="loading"
          type="number"
          :label="t('commission')"
          background
          inner-label="%"
        />
      </m-col>
      <m-col cols="4" class="flex flex-y-end">
        <m-checkbox @update-status="updateStatus" :value="!!form.status" :disabled="loading" :title="t('status')" />
      </m-col>
      <m-col cols="4" class="flex flex-y-end">
        <m-checkbox
          @update-status="updateFloatPrice"
          :value="!!form.float_price"
          :disabled="loading"
          :title="t('users.floatingPrice')"
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

<style lang="scss" scoped>
  .category-image {
    position: relative;
    // .category-image__delete
    &__delete {
      position: absolute;
      top: 10px;
      right: 10px;
      z-index: 3;
    }
  }
</style>

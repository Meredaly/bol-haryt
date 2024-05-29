<script setup>
  import { ref, onMounted } from 'vue'
  import { useI18n } from 'vue-i18n'

  import MPopUpBody from '@/UI/MPopUpBody.vue'
  import MRow from '@/UI/MRow.vue'
  import MCol from '@/UI/MCol.vue'
  import MButton from '@/UI/MButton.vue'
  import MTextFiled from '@/UI/MTextFiled.vue'
  import MImageUploader from '@/UI/MImageUploader.vue'
  import MDropdown from '@/UI/MDropdown'
  import MCheckbox from '@/UI/MCheckbox.vue'

  import { GET_PRODUCTS } from '@/api/product.api'

  import { useCategories } from '@/composables/productCategories'
  import { useValidators } from '@/helpers/validators'
  import { useToast } from '@/store/toast'

  const emit = defineEmits(['close', 'save'])

  const props = defineProps({
    item: { type: Object, default: null },
    loading: { type: Boolean, default: false }
  })

  const { categories, getCategories, getMainCategories, findSelectedCategory } = useCategories()
  const { required, optional } = useValidators()
  const toast = useToast()
  const { t, locale } = useI18n()

  const form = ref({
    name_tm: '',
    name_ru: '',
    category: '',
    product: '',
    status: 1,
    image: ''
  })

  const selectedCategory = ref(null)
  const selectBannerCategory = (category) => {
    selectedCategory.value = findSelectedCategory(category, categories.value)
    form.value.category = category.id

    selectedProduct.value = null
    form.value.product = ''
  }

  const products = ref([])
  const getProducts = async (text = '') => {
    try {
      const { data } = await GET_PRODUCTS({
        lang: 'all',
        limit: 25,
        page: 1,
        search: text
      })

      products.value =
        data.map((product) => {
          return {
            ...product,
            name: product.name[locale.value]
          }
        }) || []
    } catch (error) {
      console.error(error)
    }
  }
  getProducts()

  const selectedProduct = ref(null)
  const selectProduct = (product) => {
    selectedProduct.value = product
    form.value.product = product.id

    selectedCategory.value = null
    form.value.category = ''
  }

  const changeImage = (files) => {
    form.value.image = files[0]
  }

  const updateStatus = (status) => {
    form.value.status = status ? 1 : 0
  }

  const close = () => {
    emit('close')
  }
  const error = ref(false)
  const checkValidation = () => {
    if (required(form.value.name_tm) && required(form.value.name_ru) && required(form.value.image)) {
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

  const deleteCategory = () => {
    selectedCategory.value = null
    form.value.category = ''
  }

  const deleteProduct = () => {
    selectedProduct.value = null
    form.value.product = ''
  }

  onMounted(async () => {
    await getMainCategories()
    await getCategories()

    if (props.item) {
      form.value = {
        name_tm: props.item.name_tm,
        name_ru: props.item.name_ru,
        category: props.item.category || '',
        product: props.item.product || '',
        status: props.item.status,
        image: props.item.image || ''
      }
      props.item.category && selectBannerCategory(props.item.category)
      props.item.product && selectProduct(props.item.product)
    }
  })
</script>

<template>
  <m-pop-up-body width="700" :title="t('banner')" @close="close">
    <m-row>
      <m-col cols="4">
        <m-image-uploader
          :image-path="form.image"
          @change-file="changeImage"
          :error="error && optional(form.image)"
          :disabled="loading"
        />
      </m-col>
      <m-col cols="8">
        <m-row>
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
          <m-col cols="12" class="flex gap-10 flex-y-end">
            <m-dropdown
              @select-item="selectBannerCategory"
              :selected-item="selectedCategory"
              :items="categories"
              :disabled="loading"
              :label="t('category')"
              background
            />
            <m-button @click="deleteCategory" icon="delete" styles="danger" outline only-icon />
          </m-col>
          <m-col cols="12" class="flex gap-10 flex-y-end">
            <m-dropdown
              @select-item="selectProduct"
              @search="getProducts"
              :selected-item="selectedProduct"
              :items="products"
              :disabled="loading"
              :label="t('product')"
              background
              searchable
            />
            <m-button @click="deleteProduct" icon="delete" styles="danger" outline only-icon />
          </m-col>
        </m-row>
      </m-col>
      <m-col cols="4">
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

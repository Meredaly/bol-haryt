<script setup>
  import { ref, computed } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  import MRow from '@/UI/MRow.vue'
  import MCol from '@/UI/MCol.vue'
  import MButton from '@/UI/MButton.vue'
  import MDivider from '@/UI/MDivider.vue'
  import MCheckbox from '@/UI/MCheckbox.vue'
  import MTextFiled from '@/UI/MTextFiled.vue'
  import MTextarea from '@/UI/MTextarea.vue'
  import MImageUploader from '@/UI/MImageUploader.vue'
  import ProductImages from '@/components/ProductImages.vue'
  import MDropdown from '@/UI/MDropdown'
  import MDropdownSelect from '@/UI/MDropdownSelect'
  import MTabBar from '@/UI/MTabBar.vue'
  import MTabBarMini from '@/UI/MTabBarMini.vue'
  import MBadge from '@/UI/MBadge.vue'

  import { GET_CHARACTERISTICS } from '@/api/characteristics.api'
  import { ADD_IMAGES, SAVE_PRODUCT, EDIT_PRODUCT, GET_PRODUCT, DELETE_IMAGE, ADD_VIDEO } from '@/api/product.api'
  import { useCategories } from '@/composables/productCategories'
  import { useShops } from '@/composables/productShops'
  import { useTags } from '@/composables/productTags'
  import { useBrands } from '@/composables/productBrands'

  import { createDate } from '@/helpers/normalize'
  import { useValidators } from '@/helpers/validators'
  import { useToast } from '@/store/toast'
  import { useAuth } from '@/store/auth'

  const { required, optional } = useValidators()

  const { t, locale } = useI18n()

  const route = useRoute()
  const router = useRouter()
  const toast = useToast()
  const auth = useAuth()

  const isSeller = computed(() => auth.getRole === 'SELLER')

  const form = ref({
    name_tm: '',
    name_ru: '',
    description_tm: '',
    description_ru: '',
    category: [],
    tag: [],
    status: 1,
    created_at: '',
    seller: null,
    note: '',
    brand: null,
    weight: 0,
    length: 0,
    width: 0,
    height: 0,
    note: '',
    options: [],
    variants: [],
    deleteVariants: [],
    comment: 0,
    verify: 0
  })

  const { categories, selectedCategories, getCategories, getMainCategories, selectCategory } = useCategories(form)
  const { shops, selectedShop, getShops, selectShop } = useShops(form)
  const { tags, selectedTags, getTags, selectTag } = useTags(form)
  const { brands, selectedBrand, getBrands, selectBrand } = useBrands(form)

  const unread = ref({
    message: 0,
    comment: 0
  })

  const getProduct = async () => {
    try {
      const { data } = await GET_PRODUCT({ id: route.params.id })

      form.value = {
        id: data.id,
        name_tm: data.name.tm,
        name_ru: data.name.ru,
        description_tm: data.description.tm,
        description_ru: data.description.ru,
        category: data.category?.map((category) => category.id) || [],
        tag: data.tag?.map((tag) => tag.id) || [],
        status: data.status,
        created_at: data.created_at,
        seller: data.seller?.id || null,
        note: data.note,
        brand: data.brand?.id || null,
        weight: Number(data.weight),
        length: Number(data.length),
        width: Number(data.width),
        height: Number(data.height),
        variants: [],
        options: data.options?.map((option) => option.value.id) || [],
        order: data.order,
        deleteVariants: [],
        comment: data.comment,
        verify: data.verify
      }
      unread.value = {
        message: data.unread_message,
        comment: data.comment
      }

      data.category?.forEach((category) => selectCategory(category))

      data.options.forEach((option) => {
        const findCharacteristic = characteristics.value.find((characteristic) => {
          return characteristic.id === option.option.id
        })
        if (findCharacteristic) {
          findCharacteristic.option = {
            id: option.value.id,
            name: option.value.name[locale.value]
          }
          otherCharacteristics.value.push(findCharacteristic)
        }
      })

      if (data.brand) selectedBrand.value = { id: data.brand.id, name: data.brand.name }
      if (data.seller) selectedShop.value = { id: data.seller.id, name: data.seller.market_name }
      selectedTags.value = data.tag?.map((tagItem) => ({ id: tagItem.id, name: tagItem.name[locale.value] }))

      selectedModerationType.value =
        moderationTypes.value.find((type) => type.id === data.verify) || moderationTypes.value[0]

      if (data.video) {
        videoURL.value = data.video
      }
      normalizeVariants(data.variants)

      selectClickedVariant()
    } catch (error) {
      console.error(error)
    }
  }

  const normalizeVariants = (variants) => {
    variants.forEach((variant) => {
      const findMainCharacteristic = categoryCharacteristics.value.find(
        (characteristic) => characteristic.id === variant.option.option.id
      )
      findMainCharacteristic && selectMainCharacteristic(findMainCharacteristic)

      const newVariant = {
        id: variant.id,
        method: 'update',
        parent: variant.parent,
        name: variant.option.value.name[locale.value],
        value: variant.option.value.id,
        code: variant.code,
        price: Number(variant.old_price || variant.price),
        old_price: Number(variant.old_price ? variant.price : variant.old_price),
        discount: variant.discount,
        count: variant.count,
        order: variant.order,
        images: {
          ids: variant.images?.map((image) => image.id) || [],
          preview: variant.images?.map((image) => image.image) || []
        },
        childs: [],
        deleteChild: []
      }

      variant.childs?.forEach((child) => {
        const findSecondaryCharacteristic = categoryCharacteristics.value.find(
          (characteristic) => characteristic.id === child.option.option.id
        )
        findSecondaryCharacteristic && selectSecondaryCharacteristic(findSecondaryCharacteristic)

        newVariant.childs.push({
          id: child.id,
          method: 'update',
          value: child.option.value.id,
          name: child.option.value.name[locale.value],
          images: [],
          code: child.code,
          price: Number(child.old_price || child.price),
          old_price: Number(child.old_price ? child.price : child.old_price),
          discount: child.discount,
          count: child.count,
          order: child.order
        })
      })
      form.value.variants.push(newVariant)
    })
  }

  const selectClickedVariant = () => {
    if (route.query?.main) {
      const findVariant = form.value.variants.find((variant) => variant.value === Number(route.query.main))
      selectVariant(findVariant)
    }

    if (route.query?.secondary) {
      const findVariantChild = selectedVariant.value.childs.find(
        (child) => child.value === Number(route.query.secondary)
      )
      selectVariantChild(findVariantChild)
    }
  }

  const characteristics = ref([])
  const getCharacteristics = async () => {
    try {
      const { data } = await GET_CHARACTERISTICS({ params: { lang: 'all', main: true } })
      characteristics.value =
        data?.map((characteristic) => {
          return {
            id: characteristic.id,
            name: characteristic.name[locale.value],
            category: characteristic.category?.map((categoryItem) => categoryItem.id) || [],
            options:
              characteristic.value?.map((option) => {
                return {
                  id: option.id,
                  name: option.name[locale.value]
                }
              }) || []
          }
        }) || []
    } catch (error) {
      console.error(error)
    }
  }

  const commonCharacteristics = ref([])
  const getCommonCharacteristics = async (text = '') => {
    try {
      const { data } = await GET_CHARACTERISTICS({ params: { lang: 'all', search: text } })
      commonCharacteristics.value =
        data?.map((characteristic) => {
          return {
            id: characteristic.id,
            name: characteristic.name[locale.value],
            category: characteristic.category?.map((categoryItem) => categoryItem.id) || [],
            options:
              characteristic.value?.map((option) => {
                return {
                  id: option.id,
                  name: option.name[locale.value]
                }
              }) || []
          }
        }) || []
    } catch (error) {
      console.error(error)
    }
  }

  const selectedMainCharacteristic = ref(null)
  const selectMainCharacteristic = (characteristic) => {
    selectedMainCharacteristic.value = characteristic
  }

  const selectedSecondaryCharacteristic = ref(null)
  const selectSecondaryCharacteristic = (characteristic) => {
    selectedSecondaryCharacteristic.value = characteristic
  }
  const selectedVariant = ref(null)
  const selectedVariantChild = ref(null)

  const addVariant = (variant) => {
    form.value.variants.push({
      name: variant.name,
      value: variant.id,
      code: '',
      price: 0,
      old_price: 0,
      discount: null,
      count: 0,
      order: form.value.variants.length + 1,
      images: {
        ids: [],
        preview: []
      },
      parent: null,
      childs: [],
      deleteChild: []
    })
    if (form.value.id) {
      form.value.variants[form.value.variants.length - 1].method = 'add'
    }
    if (form.value.variants.length === 1) {
      selectVariant(form.value.variants[0])
    }
  }

  const selectVariant = (variant) => {
    selectedVariant.value = variant
    if (selectedVariant.value.childs.length > 0) {
      selectVariantChild(selectedVariant.value.childs[0])
    }
  }

  const deleteVariant = (index) => {
    if (form.value.variants[index].id) {
      form.value.deleteVariants.push({
        id: form.value.variants[index].id,
        method: 'delete'
      })
    }
    deletedImages.value.push(...form.value.variants[index].images.ids.filter((id) => !!id))
    form.value.variants.splice(index, 1)
  }

  const addChild = (child) => {
    selectedVariant.value.code = null
    selectedVariant.value.price = null
    selectedVariant.value.discount = null
    selectedVariant.value.count = null

    const newChild = {
      value: child.id,
      name: child.name,
      code: '',
      price: 0,
      discount: 0,
      old_price: 0,
      count: 0,
      images: [],
      order: selectedVariant.value.childs?.length + 1 || 1
    }

    if (selectedVariant.value?.id) {
      newChild.method = 'add'
    }

    selectedVariant.value.childs.push(newChild)

    if (selectedVariant.value.childs.length === 1) {
      selectVariantChild(selectedVariant.value.childs[0])
    }
  }

  const selectVariantChild = (child) => {
    selectedVariantChild.value = child
  }

  const deleteVariantChild = (index) => {
    if (selectedVariant.value.childs[index].id) {
      selectedVariant.value.deleteChild.push({
        id: selectedVariant.value.childs[index].id,
        method: 'delete'
      })
    }
    selectedVariant.value.childs.splice(index, 1)
    if (selectedVariant.value.childs.length) selectVariantChild(selectedVariant.value.childs[0])
  }

  const selectImages = async (files) => {
    let variant = selectedVariant.value
    for (let index = 0; index < files.length; index++) {
      variant.images.preview.push(URL.createObjectURL(files[index]))
    }
    let newImages = await addImages(files)
    variant.images.ids.push(...newImages)
  }

  const addImages = async (images) => {
    try {
      const formData = new FormData()

      for (let index = 0; index < images.length; index++) {
        formData.append('images', images[index])
      }

      const { data } = await ADD_IMAGES(formData)
      return data?.map((image) => image.id) || []
    } catch (error) {
      console.error(error)
    }
  }

  const deletedImages = ref([])
  const deleteImage = (index) => {
    if (selectedVariant.value.images.ids[index] !== null) {
      deletedImages.value.push(selectedVariant.value.images.ids[index])
    }
    selectedVariant.value.images.ids.splice(index, 1)
    selectedVariant.value.images.preview.splice(index, 1)
  }

  const removeProductImage = async () => {
    try {
      for (let imageId of deletedImages.value) {
        await DELETE_IMAGE({ id: imageId })
      }
    } catch (error) {
      console.error(error)
    }
  }

  const categoryCharacteristics = computed(() => {
    const newOtherCharacteristics = []
    const newOptions = []
    otherCharacteristics.value.forEach((characteristic) => {
      const status = form.value.category?.some((formCategory) => {
        return characteristic?.category?.includes(formCategory)
      })

      if (status) {
        newOtherCharacteristics.push(characteristic)
        characteristic.option?.id && newOptions.push(characteristic.option.id)
      }
    })

    otherCharacteristics.value = newOtherCharacteristics
    form.value.options = newOptions

    return characteristics.value?.filter((characteristic) => {
      return form.value.category?.some((formCategory) => {
        return characteristic.category.includes(formCategory)
      })
    })
  })

  const otherCharacteristics = ref([])
  const addCharacteristic = () => {
    otherCharacteristics.value.push(null)
    form.value.options.push(null)
  }
  const selectOtherCharacteristic = (index, characteristic) => {
    otherCharacteristics.value[index] = JSON.parse(JSON.stringify(characteristic))
  }
  const selectOtherOption = (index, option) => {
    otherCharacteristics.value[index].option = option
    form.value.options[index] = option.id
  }
  const deleteOtherCharacteristic = (index) => {
    otherCharacteristics.value.splice(index, 1)
    form.value.options.splice(index, 1)
  }

  function timeout(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  const videoURL = ref(null)
  const video = ref('')
  const videoProgress = ref(0)
  const changeVideo = (files) => {
    if (files) {
      video.value = files[0]
      videoURL.value = URL.createObjectURL(files[0])
    }
  }

  const deleteVideo = () => {
    video.value = ''
    videoURL.value = null
  }

  const error = ref(false)
  const checkValidation = () => {
    const isCharacteristics = otherCharacteristics.value.every((characteristic) => {
      return required(characteristic) && required(characteristic?.option)
    })
    const isImages = form.value.variants.every((variant) => variant.images.preview.length)
    const isPrices = form.value.variants.every((variant) => {
      if (variant.childs?.length) {
        return variant.childs.every((child) => required(child.price))
      }
      return required(variant.price)
    })

    const isCode = form.value.variants.every((variant) => {
      if (variant.childs?.length) {
        return variant.childs.every((child) => required(child.code))
      }
      return required(variant.code)
    })

    if (
      required(form.value.name_tm) &&
      required(form.value.name_ru) &&
      required(selectedCategories.value.length) &&
      (required(form.value.seller) || isSeller.value) &&
      required(selectedMainCharacteristic.value) &&
      isCharacteristics &&
      isImages &&
      isPrices &&
      isCode
    ) {
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

  const loading = ref(false)
  const saveProduct = async () => {
    try {
      if (!checkValidation()) {
        return
      }

      loading.value = true

      form.value.created_at = createDate()
      await removeProductImage()

      let imagesLoading = true
      while (imagesLoading) {
        let status = form.value.variants.every((variant) => variant.images.ids.length === variant.images.preview.length)
        if (!status) {
          await timeout(1000)
          continue
        }
        imagesLoading = false
      }

      const newForm = {
        name_tm: form.value.name_tm,
        name_ru: form.value.name_ru,
        description_tm: form.value.description_tm,
        description_ru: form.value.description_ru,
        category: form.value.category,
        tag: form.value.tag,
        status: form.value.status,
        created_at: form.value.created_at || createDate(),
        seller: form.value.seller,
        note: form.value.note,
        brand: form.value.brand,
        weight: form.value.weight,
        length: form.value.length,
        width: form.value.width,
        height: form.value.height,
        options: form.value.options,
        verify: form.value.verify,
        variants: variantsUpdateForSave()
      }

      if (isSeller.value) {
        newForm.verify = 0
      }
      let responseId = null

      if (form.value.id) {
        newForm.id = form.value.id
        const { data } = await EDIT_PRODUCT({ id: form.value.id, data: newForm })
        responseId = data.id
      } else {
        const { data } = await SAVE_PRODUCT(newForm)
        responseId = data.id
      }

      const onUploadProgress = {
        onUploadProgress: (progressEvent) => {
          videoProgress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        }
      }

      await ADD_VIDEO({
        id: responseId,
        data: {
          video: video.value
        },
        onUploadProgress
      })

      toast.addToast({
        text: t('productSaved')
      })
      back()
    } catch (error) {
      console.error(error)
      loading.value = false

      toast.addToast({
        text: t('someProblemsWithServer'),
        status: 'error'
      })

      videoProgress.value = 0
    }
  }

  const variantsUpdateForSave = () => {
    const newVariants = form.value.variants.map((variant) => {
      const newVariant = JSON.parse(JSON.stringify(variant))
      delete newVariant.name
      newVariant.images = newVariant.images.ids

      newVariant.childs.push(...newVariant.deleteChild)
      delete newVariant.deleteChild

      newVariant.childs.map((child) => {
        delete child.name

        const oldPrice = child.old_price
        const price = child.price
        child.price = oldPrice || price
        child.old_price = !!oldPrice ? price : oldPrice
      })

      return newVariant
    })
    return [...newVariants, ...form.value.deleteVariants]
  }

  const updateStatus = (status) => {
    form.value.status = status ? 1 : 0
  }

  const back = () => {
    router.go(-1)
  }

  const openComments = () => {
    router.push(`/product-comments/${route.params.id}`)
  }

  const openChats = () => {
    router.push(`/product-chats/${route.params.id}`)
  }

  const moderationTypes = ref([
    { id: 0, name: t('underReview'), style: 'warning' },
    { id: 1, name: t('confirmed'), style: 'success' },
    { id: 2, name: t('rejected'), style: 'danger' }
  ])

  const selectedModerationType = ref(moderationTypes.value[0])
  const selectModerationType = (moderationType) => {
    selectedModerationType.value = moderationType
    form.value.verify = moderationType.id
  }

  const getVerifyTitle = () => {
    return moderationTypes.value.find((type) => type.id === selectedModerationType.value.id)?.name || ''
  }
  const getVerifyStyle = () => {
    return moderationTypes.value.find((type) => type.id === selectedModerationType.value.id)?.style || ''
  }

  const getProductStructure = async () => {
    if (!isSeller.value) {
      getShops()
    }
    if (isSeller.value?.value) {
      form.value.seller = auth.getUser.id
    }
    await getBrands()
    await getTags()
    await getMainCategories()
    await getCategories()
    await getCharacteristics()
    await getCommonCharacteristics()

    if (route.params.id !== 'new') getProduct()
  }

  if (isSeller.value) {
    form.value.seller = auth.getUser.id
  }
  getProductStructure()

  const updatePrice = (child) => {
    updateOldPrice(child)
  }

  const updateDiscount = (child) => {
    const present = child.price / 100
    let oldPrice = Math.round(child.price - present * child.discount)
    child.old_price = child.discount > 0 ? oldPrice : 0
  }

  const updateOldPrice = (child) => {
    const present = child?.price ? child.price / 100 : 0
    const betweenPrice = child.price - child.old_price

    let discount = child?.old_price ? Math.round(betweenPrice / present) : 0
    child.discount = discount < 0 ? 0 : discount
  }

  const computedCommission = computed(() => {
    let categoryCommission = 0
    selectedCategories.value?.map((category) => {
      categoryCommission = category.fee > categoryCommission ? category.fee : categoryCommission
    })
    return selectedShop.value.fee || categoryCommission
  })

  const childTotalPrice = (child) => {
    const currentPrice = child.old_price || child.price
    const percentCount = Math.round((currentPrice / 100) * Number(computedCommission.value))
    return currentPrice - percentCount
  }
  const removeBrand = () => {
    selectedBrand.value = null
    form.value.brand = null
  }
</script>

<template>
  <div class="product _box">
    <m-row>
      <m-col cols="6" class="flex flex-y-center gap-10">
        <m-button @click="back" :title="t('back')" icon="chevronLeft" styles="secondary" outline />
        <m-badge :title="getVerifyTitle()" :styles="getVerifyStyle()" />
        <p v-if="isSeller">{{ t('afterSaveProductAlert') }}</p>
      </m-col>
      <m-col cols="6" class="flex flex-x-end gap-10">
        <m-button v-if="route.params.id" @click="openChats" :title="t('message')" soft styles="primary">
          <div v-if="unread.message" class="product__comment">{{ unread.message || 0 }}</div>
        </m-button>
        <m-button
          v-if="route.params.id"
          @click="openComments"
          :title="t('comments')"
          soft
          styles="primary"
          class="mr-30"
        >
          <div v-if="unread.comment" class="product__comment">{{ unread.comment }}</div>
        </m-button>
        <m-button @click="back" :disabled="loading" :title="t('cancel')" styles="secondary" />
        <m-button @click="saveProduct" :disabled="loading" :loading="loading" :title="t('save')" />
      </m-col>
      <m-col cols="6">
        <m-text-filed
          v-model.trim="form.name_ru"
          :disabled="loading"
          :error="error && optional(form.name_ru)"
          :label="`${t('name')} RU`"
          background
          required
        />
      </m-col>
      <m-col cols="6">
        <m-text-filed
          v-model.trim="form.name_tm"
          :disabled="loading"
          :error="error && optional(form.name_tm)"
          :label="`${t('name')} TM`"
          background
          required
        />
      </m-col>
      <m-col cols="6">
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
      <m-col cols="6" v-if="!isSeller">
        <m-dropdown
          @select-item="selectShop"
          @search="getShops"
          :items="shops"
          :selected-item="selectedShop"
          :disabled="loading"
          :error="error && optional(form.seller)"
          :label="t('shop')"
          background
          required
          searchable
        />
      </m-col>
      <m-col cols="6">
        <m-dropdown
          @select-item="selectBrand"
          @search="getBrands"
          @remove="removeBrand"
          :items="brands"
          :selected-item="selectedBrand"
          :disabled="loading"
          :label="t('brand')"
          searchable
          show-remove
          background
        />
      </m-col>
      <m-col cols="6">
        <m-dropdown-select
          @select-item="selectTag"
          :selected-items="selectedTags"
          :items="tags"
          :disabled="loading"
          :label="t('tag')"
          background
        />
      </m-col>

      <m-col cols="12">
        <m-divider :title="t('selectOption')" />
      </m-col>
      <m-col cols="6">
        <m-dropdown
          @select-item="selectMainCharacteristic"
          :selected-item="selectedMainCharacteristic"
          :items="categoryCharacteristics"
          :error="error && optional(selectedMainCharacteristic)"
          :label="t('mainOption')"
          required
          background
          :disabled="loading"
        />
      </m-col>
      <m-col cols="6">
        <m-dropdown
          @select-item="selectSecondaryCharacteristic"
          :selected-item="selectedSecondaryCharacteristic"
          :items="categoryCharacteristics"
          :label="t('secondaryOption')"
          background
          :disabled="!selectedMainCharacteristic || loading"
        />
      </m-col>
      <m-col cols="12">
        <m-divider />
      </m-col>
      <template v-if="selectedMainCharacteristic">
        <m-col cols="12">
          <m-tab-bar
            @add-item="addVariant"
            @select-item="selectVariant"
            @delete-item="deleteVariant"
            :selected-item="selectedVariant"
            :items="form.variants"
            :menu="selectedMainCharacteristic?.options"
            :disabled="loading"
            dnd
          />
        </m-col>
        <template v-if="form.variants.length">
          <m-col cols="12">
            <m-row>
              <m-col cols="4">
                <product-images
                  @select="selectImages"
                  @delete="deleteImage"
                  :images="selectedVariant?.images.preview"
                  :error="error && optional(selectedVariant?.images.preview.length)"
                  :disabled="loading"
                />
              </m-col>
              <m-col cols="8">
                <m-row>
                  <m-col v-if="selectedSecondaryCharacteristic" cols="12" class="pt-50">
                    <m-tab-bar-mini
                      @add-item="addChild"
                      @select-item="selectVariantChild"
                      @delete-item="deleteVariantChild"
                      :selected-item="selectedVariantChild"
                      :items="selectedVariant?.childs"
                      :disabled="loading"
                      :menu="selectedSecondaryCharacteristic?.options"
                    />
                  </m-col>
                  <template v-if="selectedVariant?.childs.length">
                    <template v-for="child in selectedVariant?.childs">
                      <template v-if="selectedVariantChild?.value === child.value">
                        <m-col cols="3" class="pt-30">
                          <m-text-filed
                            @updateValue="updatePrice(child)"
                            v-model.trim="child.price"
                            :disabled="loading"
                            :error="error && optional(child.price)"
                            :label="t('price')"
                            inner-label="TMT"
                            background
                            required
                            type="number"
                          />
                        </m-col>
                        <m-col cols="3" class="pt-30">
                          <m-text-filed
                            v-model.trim="child.old_price"
                            @updateValue="updateOldPrice(child)"
                            :disabled="loading"
                            :label="t('discountPrice')"
                            inner-label="TMT"
                            background
                            type="number"
                          />
                        </m-col>
                        <m-col cols="3" class="pt-30">
                          <m-text-filed
                            v-model.trim="child.discount"
                            @updateValue="updateDiscount(child)"
                            :disabled="loading"
                            :label="t('percentageDiscount')"
                            inner-label="%"
                            background
                            type="number"
                          />
                        </m-col>
                        <m-col cols="3" class="pt-30">
                          <m-text-filed
                            v-model.trim="child.count"
                            :disabled="loading"
                            :label="t('productsCount')"
                            background
                            type="number"
                          />
                        </m-col>
                        <m-col cols="3">
                          <m-text-filed
                            :value="computedCommission"
                            :label="t('commission')"
                            background
                            disabled
                            inner-label="%"
                          />
                        </m-col>
                        <m-col cols="3">
                          <m-text-filed
                            :value="childTotalPrice(child)"
                            :label="t('totalPrice')"
                            background
                            disabled
                            inner-label="TMT"
                          />
                        </m-col>
                        <m-col cols="3"> </m-col>
                        <m-col cols="3">
                          <m-text-filed
                            v-model.trim="child.code"
                            :disabled="loading"
                            :error="error && optional(child.code)"
                            :label="t('barcode')"
                            background
                            required
                          />
                        </m-col>
                      </template>
                    </template>
                  </template>
                  <template v-else>
                    <m-col cols="3" class="pt-30">
                      <m-text-filed
                        @updateValue="updatePrice(selectedVariant)"
                        v-model.trim="selectedVariant.price"
                        :disabled="loading"
                        :error="error && optional(selectedVariant.price)"
                        :label="t('price')"
                        inner-label="TMT"
                        background
                        type="number"
                        required
                      />
                    </m-col>
                    <m-col cols="3" class="pt-30">
                      <m-text-filed
                        v-model.trim="selectedVariant.old_price"
                        @updateValue="updateOldPrice(selectedVariant)"
                        :disabled="loading"
                        :label="t('discountPrice')"
                        inner-label="TMT"
                        background
                        type="number"
                      />
                    </m-col>
                    <m-col cols="3" class="pt-30">
                      <m-text-filed
                        v-model.trim="selectedVariant.discount"
                        @updateValue="updateDiscount(selectedVariant)"
                        :disabled="loading"
                        :label="t('percentageDiscount')"
                        inner-label="%"
                        background
                        type="number"
                      />
                    </m-col>
                    <m-col cols="3" class="pt-30">
                      <m-text-filed
                        v-model.trim="selectedVariant.count"
                        :disabled="loading"
                        :label="t('productsCount')"
                        background
                        type="number"
                      />
                    </m-col>
                    <m-col cols="3">
                      <m-text-filed
                        :value="computedCommission"
                        :label="t('commission')"
                        background
                        disabled
                        inner-label="%"
                      />
                    </m-col>
                    <m-col cols="3">
                      <m-text-filed
                        :value="childTotalPrice(selectedVariant)"
                        :label="t('totalPrice')"
                        background
                        disabled
                        inner-label="TMT"
                      />
                    </m-col>
                    <m-col cols="3"></m-col>
                    <m-col cols="3">
                      <m-text-filed
                        v-model.trim="selectedVariant.code"
                        :disabled="loading"
                        :error="error && optional(selectedVariant.code)"
                        :label="t('barcode')"
                        background
                        required
                      />
                    </m-col>
                  </template>
                </m-row>
              </m-col>
            </m-row>
          </m-col>
        </template>
      </template>
      <m-col cols="12">
        <m-divider />
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
        <m-divider :title="t('generalCharacteristics')" />
      </m-col>
      <template v-for="(otherCharacteristic, index) in otherCharacteristics">
        <m-col cols="6">
          <m-dropdown
            @select-item="(characteristic) => selectOtherCharacteristic(index, characteristic)"
            :selected-item="otherCharacteristic"
            @search="getCommonCharacteristics"
            :items="commonCharacteristics"
            :disabled="loading"
            :error="error && optional(otherCharacteristic)"
            :label="t('characteristic')"
            searchable
            required
            background
          />
        </m-col>
        <m-col cols="6" class="flex gap-10 flex-y-end">
          <m-dropdown
            @select-item="(option) => selectOtherOption(index, option)"
            :selected-item="otherCharacteristic?.option"
            :items="otherCharacteristic?.options"
            :disabled="!otherCharacteristic || loading"
            :error="error && optional(otherCharacteristic?.option)"
            :label="t('option')"
            required
            background
          />
          <m-button
            @click="deleteOtherCharacteristic(index)"
            :disabled="loading"
            icon="delete"
            styles="danger"
            outline
            only-icon
            large
          />
        </m-col>
      </template>
      <m-col cols="12">
        <m-button
          @click="addCharacteristic"
          :disabled="!form.category.length || loading"
          icon="add"
          :title="t('addCharacteristic')"
          block
          outline
        />
      </m-col>
      <m-col cols="12">
        <m-divider title="Видео" />
      </m-col>
      <m-col cols="4">
        <div class="product__video">
          <m-image-uploader
            @changeFile="changeVideo"
            accept="video/*"
            :disabled="loading"
            :title="t('clickDownloadVideo')"
            :preview="false"
          />
        </div>
      </m-col>
      <m-col cols="4">
        <div v-if="videoURL" class="product__video-preview">
          <video :src="videoURL" controls></video>
          <div v-if="videoProgress" class="product__video-upload-progress">{{ videoProgress }}%</div>
          <m-button
            @click="deleteVideo"
            :disabled="loading"
            icon="delete"
            styles="danger"
            outline
            only-icon
            large
            class="product__video-delete"
          />
        </div>
      </m-col>
      <m-col cols="12">
        <m-divider :title="t('forDelivery')" />
      </m-col>
      <m-col cols="3">
        <m-text-filed
          v-model.trim="form.weight"
          :disabled="loading"
          :label="t('weight')"
          background
          :inner-label="t('kg')"
          type="number"
        />
      </m-col>
      <m-col cols="1">
        <m-text-filed
          v-model.trim="form.width"
          :disabled="loading"
          :label="t('width')"
          background
          :inner-label="t('sm')"
          type="number"
        />
      </m-col>
      <m-col cols="1">
        <m-text-filed
          v-model.trim="form.length"
          :disabled="loading"
          :label="t('length')"
          background
          :inner-label="t('sm')"
          type="number"
        />
      </m-col>
      <m-col cols="1">
        <m-text-filed
          v-model.trim="form.height"
          :disabled="loading"
          :label="t('height')"
          background
          :inner-label="t('sm')"
          type="number"
        />
      </m-col>
      <m-col cols="12">
        <m-text-filed v-model.trim="form.note" :disabled="loading" :label="t('note')" background />
      </m-col>
      <m-col cols="4">
        <m-checkbox @update-status="updateStatus" :value="!!form.status" :disabled="loading" :title="t('status')" />
      </m-col>
      <m-col cols="4" v-if="!isSeller">
        <m-dropdown
          @select-item="selectModerationType"
          :selected-item="selectedModerationType"
          :items="moderationTypes"
          :label="t('moderation')"
          background
          :disabled="loading"
        />
      </m-col>
    </m-row>
  </div>
</template>

<style lang="scss" scoped>
  .product {
    height: 100%;
    overflow: auto;

    // .product__comment
    &__comment {
      margin-left: 6px;
      color: var(--white);
      background-color: var(--primary-600);
      padding: 5px;
      min-width: 26px;
      border-radius: 12px;
      margin: -5px 0;
      margin-left: 6px;
    }
    // .product__video
    &__video {
      .image-uploader {
        padding-top: 50%;
      }
    }

    // .product__video-preview
    &__video-preview {
      padding-top: 50%;
      position: relative;
      video {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
      }
    }
    // .product__video-upload-progress
    &__video-upload-progress {
      position: absolute;
      width: 100%;
      height: 100%;
      left: 0;
      top: 0;
      z-index: 1;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--primary-600);
      font-size: 40px;
      font-weight: 600;
      user-select: none;
      pointer-events: none;
    }

    // .product__video-delete
    &__video-delete {
      position: absolute;
      top: 20px;
      right: 20px;
    }
  }
</style>

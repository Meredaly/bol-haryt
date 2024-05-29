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
  import MDropdown from '@/UI/MDropdown'
  import MDropdownSelect from '@/UI/MDropdownSelect'
  import ProductImages from '@/components/ProductImages.vue'
  import MImageUploader from '@/UI/MImageUploader.vue'
  import MBadge from '@/UI/MBadge.vue'

  import { GET_CHARACTERISTICS } from '@/api/characteristics.api'
  import { GET_PRODUCT, SAVE_PRODUCT, EDIT_PRODUCT, ADD_IMAGES, DELETE_IMAGE, ADD_VIDEO } from '@/api/product.api'

  import { useCategories } from '@/composables/productCategories'
  import { useShops } from '@/composables/productShops'
  import { useTags } from '@/composables/productTags'
  import { useBrands } from '@/composables/productBrands'
  import { useToast } from '@/store/toast'
  import { useAuth } from '@/store/auth'

  import { createDate } from '@/helpers/normalize'
  import { useValidators } from '@/helpers/validators'

  const { t, locale } = useI18n()

  const route = useRoute()
  const router = useRouter()
  const toast = useToast()
  const auth = useAuth()

  const { required, optional } = useValidators()

  const isSeller = computed(() => auth.getRole === 'SELLER')

  const back = () => {
    router.go(-1)
  }

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
    verify: 0,
    variants: [
      {
        code: '',
        price: 0,
        discount: null,
        count: 0,
        images: [],
        order: 1,
        old_price: 0,
        value: null
      }
    ],
    options: [],
    comment: 0
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
        variants: [
          {
            method: 'update',
            id: data.variants[0].id,
            code: data.variants[0].code,
            price: Number(data.variants[0].old_price || data.variants[0].price),
            old_price: Number(data.variants[0].old_price ? data.variants[0].price : data.variants[0].old_price),
            discount: Number(data.variants[0].discount),
            count: Number(data.variants[0].count),
            images: [],
            order: Number(data.variants[0].order),
            value: null
          }
        ],
        verify: data.verify,
        options: data.options?.map((option) => option.value.id) || [],
        order: data.order,
        comment: data.comment
      }

      if (data.video) {
        videoURL.value = data.video
      }

      unread.value = {
        message: data.unread_message,
        comment: data.comment
      }

      data.category?.forEach((category) => selectCategory(category))

      data.options.forEach((option) => {
        let findCharacteristic = characteristics.value.find((characteristic) => {
          return characteristic.id === option.option.id
        })
        if (findCharacteristic) {
          findCharacteristic = JSON.parse(JSON.stringify(findCharacteristic))
          findCharacteristic.option = {
            id: option.value.id,
            name: option.value.name[locale.value]
          }
          selectedCharacteristics.value.push(findCharacteristic)
        }
      })

      data.variants[0].images.forEach((image) => {
        form.value.variants[0].images.push(image.id)
        imagePreviews.value.push(image.image)
      })
      if (data.brand) selectedBrand.value = { id: data.brand.id, name: data.brand.name }
      if (data.seller) selectedShop.value = { ...data.seller, name: data.seller.market_name }
      selectedTags.value = data.tag?.map((tagItem) => ({ id: tagItem.id, name: tagItem.name[locale.value] }))

      selectedModerationType.value =
        moderationTypes.value.find((type) => type.id === data.verify) || moderationTypes.value[0]
    } catch (error) {
      console.error(error)
    }
  }

  const characteristics = ref([])
  const getCharacteristics = async () => {
    try {
      const { data } = await GET_CHARACTERISTICS({
        params: {
          lang: 'all'
        }
      })
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

  const categoryCharacteristics = computed(() => {
    const newSelectedCharacteristics = []
    const newOptions = []
    selectedCharacteristics.value.forEach((characteristic) => {
      const status = form.value.category?.some((formCategory) => {
        return characteristic?.category?.includes(formCategory)
      })
      if (status) {
        newSelectedCharacteristics.push(JSON.parse(JSON.stringify(characteristic)))
        characteristic.option?.id && newOptions.push(characteristic.option.id)
      }
    })

    selectedCharacteristics.value = newSelectedCharacteristics
    form.value.options = newOptions

    return characteristics.value?.filter((characteristic) => {
      return form.value.category?.some((formCategory) => {
        return characteristic.category.includes(formCategory)
      })
    })
  })

  const selectedCharacteristics = ref([])
  const addCharacteristic = () => {
    selectedCharacteristics.value.push(null)
    form.value.options.push(null)
  }
  const selectCharacteristic = (index, characteristic) => {
    selectedCharacteristics.value[index] = JSON.parse(JSON.stringify(characteristic))
  }
  const selectOption = (index, option) => {
    selectedCharacteristics.value[index].option = JSON.parse(JSON.stringify(option))
    form.value.options[index] = option.id
  }
  const deleteSelectedCharacteristic = (index) => {
    selectedCharacteristics.value.splice(index, 1)
    form.value.options.splice(index, 1)
  }

  const imagePreviews = ref([])

  const selectImages = async (files) => {
    for (let index = 0; index < files.length; index++) {
      imagePreviews.value.push(URL.createObjectURL(files[index]))
    }
    let newImages = await addImages(files)
    form.value.variants[0].images.push(...newImages)
  }

  const deletedImages = ref([])
  const deleteImage = (index) => {
    if (form.value.variants[0].images[index] !== null) {
      deletedImages.value.push(form.value.variants[0].images[index])
      form.value.variants[0].images.splice(index, 1)
    }
    imagePreviews.value.splice(index, 1)
  }

  const updateStatus = (status) => {
    form.value.status = status ? 1 : 0
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

  const removeProductImage = async () => {
    try {
      for (let imageId of deletedImages.value) {
        await DELETE_IMAGE({ id: imageId })
      }
    } catch (error) {
      console.error(error)
    }
  }

  const videoURL = ref('')
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
    videoURL.value = ''
  }

  const error = ref(false)
  const checkValidation = () => {
    const isCharacteristics = selectedCharacteristics.value.every((characteristic) => {
      return required(characteristic) && required(characteristic?.option)
    })
    if (
      required(form.value.name_tm) &&
      required(form.value.name_tm) &&
      required(imagePreviews.value.length) &&
      required(selectedCategories.value.length) &&
      (required(form.value.seller) || isSeller.value) &&
      required(form.value.variants[0].code) &&
      required(form.value.variants[0].price) &&
      isCharacteristics
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
      let responseId = null
      while (imagesLoading) {
        if (form.value.variants[0].images.length !== imagePreviews.value.length) {
          await timeout(1000)
          continue
        }
        imagesLoading = false
      }

      if (isSeller.value) {
        form.value.verify = 0
      }
      const saveForm = JSON.parse(JSON.stringify(form.value))
      saveForm.variants[0].price = form.value.variants[0].old_price || form.value.variants[0].price
      saveForm.variants[0].old_price = !!form.value.variants[0].old_price
        ? form.value.variants[0].price
        : form.value.variants[0].old_price

      if (route.params.id !== 'new') {
        const { data } = await EDIT_PRODUCT({ id: route.params.id, data: saveForm })
        responseId = data.id
      } else {
        const { data } = await SAVE_PRODUCT(saveForm)
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
    } catch (err) {
      console.error(err)
      loading.value = false

      toast.addToast({
        text: t('someProblemsWithServer'),
        status: 'error'
      })

      videoProgress.value = 0
    }
  }
  function timeout(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
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
    if (isSeller.value) {
      form.value.seller = auth.getUser.id
    }
    getBrands()
    getTags()
    await getMainCategories()
    await getCategories()
    await getCharacteristics()

    if (route.params.id !== 'new') getProduct()
  }

  if (isSeller.value) {
    form.value.seller = auth.getUser.id
  }
  getProductStructure()

  const updatePrice = () => {
    updateOldPrice()
  }

  const updateOldPrice = () => {
    const present = form.value.variants[0]?.price ? form.value.variants[0].price / 100 : 0
    const betweenPrice = form.value.variants[0].price - form.value.variants[0].old_price

    let discount = form.value.variants[0]?.old_price ? Math.round(betweenPrice / present) : 0
    form.value.variants[0].discount = discount < 0 ? 0 : discount
  }

  const updateDiscount = () => {
    const present = form.value.variants[0].price / 100
    let oldPrice = Math.round(form.value.variants[0].price - present * form.value.variants[0].discount)
    form.value.variants[0].old_price = form.value.variants[0].discount > 0 ? oldPrice : 0
  }

  const computedCommission = computed(() => {
    let categoryCommission = 0
    selectedCategories.value?.map((category) => {
      categoryCommission = category.fee > categoryCommission ? category.fee : categoryCommission
    })
    return selectedShop.value.fee || categoryCommission
  })

  const computedTotalPrice = computed(() => {
    const currentPrice = form.value.variants[0].old_price || form.value.variants[0].price
    const percentCount = Math.round((currentPrice / 100) * Number(computedCommission.value))
    return currentPrice - percentCount
  })

  const removeBrand = () => {
    selectedBrand.value = null
    form.value.brand = null
  }
</script>

<template>
  <div class="product _box _custom-scroll">
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
      <m-col cols="12">
        <m-row>
          <m-col cols="4">
            <product-images
              @select="selectImages"
              @delete="deleteImage"
              :images="imagePreviews"
              :disabled="loading"
              :error="error && optional(imagePreviews.length)"
            />
          </m-col>
          <m-col cols="8">
            <m-row>
              <m-col cols="12">
                <m-dropdown-select
                  @select-item="selectCategory"
                  @search="getCategories"
                  :items="categories"
                  :disabled="loading"
                  :selected-items="selectedCategories"
                  :error="error && optional(selectedCategories.length)"
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
                  required
                  searchable
                  :label="t('shop')"
                  background
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
              <m-col cols="12">
                <m-dropdown-select
                  @select-item="selectTag"
                  @search="getTags"
                  :selected-items="selectedTags"
                  :items="tags"
                  :disabled="loading"
                  :label="t('tag')"
                  searchable
                  background
                />
              </m-col>
              <m-col cols="3">
                <m-text-filed
                  v-model.trim="form.variants[0].price"
                  @updateValue="updatePrice"
                  :disabled="loading"
                  :error="error && optional(form.variants[0].price)"
                  :label="t('price')"
                  inner-label="TMT"
                  background
                  type="number"
                  required
                />
              </m-col>
              <m-col cols="3">
                <m-text-filed
                  v-model.trim="form.variants[0].old_price"
                  @updateValue="updateOldPrice"
                  :disabled="loading"
                  :label="t('discountPrice')"
                  inner-label="TMT"
                  type="number"
                  background
                />
              </m-col>
              <m-col cols="3">
                <m-text-filed
                  v-model.trim="form.variants[0].discount"
                  @updateValue="updateDiscount"
                  :disabled="loading"
                  :label="t('percentageDiscount')"
                  inner-label="%"
                  background
                  type="number"
                />
              </m-col>
              <m-col cols="3">
                <m-text-filed
                  v-model.trim="form.variants[0].count"
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
                  :value="computedTotalPrice"
                  :label="t('totalPrice')"
                  background
                  disabled
                  inner-label="TMT"
                />
              </m-col>
              <m-col cols="3"> </m-col>
              <m-col cols="3">
                <m-text-filed
                  v-model.trim="form.variants[0].code"
                  :disabled="loading"
                  :error="error && optional(form.variants[0].code)"
                  :label="t('barcode')"
                  background
                  required
                />
              </m-col>
            </m-row>
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
        <m-divider :title="t('characteristics')" />
      </m-col>
      <template v-for="(selectedCharacteristic, index) in selectedCharacteristics">
        <m-col cols="6">
          <m-dropdown
            @select-item="(characteristic) => selectCharacteristic(index, characteristic)"
            :selected-item="selectedCharacteristic"
            :items="categoryCharacteristics"
            :disabled="loading"
            :error="error && optional(selectedCharacteristic)"
            :label="t('characteristic')"
            required
            background
          />
        </m-col>
        <m-col cols="6" class="flex gap-10 flex-y-end">
          <m-dropdown
            @select-item="(option) => selectOption(index, option)"
            :selected-item="selectedCharacteristic?.option"
            :items="selectedCharacteristic?.options"
            :disabled="!selectedCharacteristic || loading"
            :error="error && optional(selectedCharacteristic?.option)"
            :label="t('option')"
            required
            background
          />
          <m-button
            @click="deleteSelectedCharacteristic(index)"
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
        <m-divider :title="t('video')" />
      </m-col>
      <m-col cols="4">
        <div class="product__video">
          <m-image-uploader
            @changeFile="changeVideo"
            :disabled="loading"
            accept="video/*"
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
          :disabled="loading"
          :label="t('moderation')"
          background
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

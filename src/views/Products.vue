<script setup>
  import { ref, watch, computed, reactive } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { useI18n } from 'vue-i18n'

  import MButton from '@/UI/MButton.vue'
  import MImage from '@/UI/MImage.vue'
  import MTextFiled from '@/UI/MTextFiled.vue'
  import MPagination from '@/UI/MPagination.vue'
  import MBadge from '@/UI/MBadge.vue'
  import MDropdownDots from '@/UI/MDropdownDots'
  import PopUpConfirm from '@/components/popUps/PopUpConfirm.vue'
  import MDropdown from '@/UI/MDropdown'
  import PopUpProductVariant from '@/components/popUps/PopUpProductVariant.vue'

  import { GET_PRODUCTS, DELETE_PRODUCT, EDIT_PRODUCT_VARIANT } from '@/api/product.api'

  import { useCategories } from '@/composables/productCategories'
  import { useTags } from '@/composables/productTags'
  import { useShops } from '@/composables/productShops'
  import { useToast } from '@/store/toast'
  import { useAuth } from '@/store/auth'

  const router = useRouter()
  const route = useRoute()
  const toast = useToast()
  const auth = useAuth()
  const { t, locale } = useI18n()

  const isSeller = computed(() => auth.getRole === 'SELLER')

  const sorts = computed(() => [
    { id: 1, key: 'sort_date', value: 'dec', name: t('dateAsc') },
    { id: 2, key: 'sort_date', value: 'asc', name: t('dateDec') },
    { id: 3, key: 'name', value: 'dec', name: t('nameDec') },
    { id: 4, key: 'name', value: 'asc', name: t('nameAsc') },
    { id: 5, key: 'price', value: 'dec', name: t('priceDec') },
    { id: 6, key: 'price', value: 'asc', name: t('priceAsc') },
    { id: 7, key: 'discount', value: 'dec', name: t('discountDec') },
    { id: 8, key: 'discount', value: 'asc', name: t('discountAsc') },
    { id: 9, key: 'old_price', value: 'dec', name: t('oldPriceDec') },
    { id: 10, key: 'old_price', value: 'asc', name: t('oldPriceAsc') },
    { id: 11, key: 'sold', value: 'dec', name: t('soldDec') },
    { id: 12, key: 'sold', value: 'asc', name: t('soldAsc') },
    { id: 13, key: 'count', value: 'dec', name: t('countDec') },
    { id: 14, key: 'count', value: 'asc', name: t('countAsc') },
    { id: 15, key: 'view', value: 'dec', name: t('viewDec') },
    { id: 16, key: 'view', value: 'asc', name: t('viewAsc') }
  ])

  const selectedSort = ref(sorts.value[0])
  const selectSort = (sort) => {
    selectedSort.value = sort

    pushByParams()
  }

  const moderationTypes = computed(() => {
    return [
      { id: 0, key: 'under_review', name: t('underReview'), style: 'warning' },
      { id: 1, key: 'confirmed', name: t('confirmed'), style: 'success' },
      { id: 2, key: 'rejected', name: t('rejected'), style: 'danger' }
    ]
  })

  const filters = computed(() => [
    { id: 'ALL', name: t('all') },
    { id: 'CATEGORIES', name: t('categories') },
    { id: 'TAGS', name: t('tags') },
    { id: 'VISIBILITY', name: t('status') },
    { id: 'FILTER_COUNT_EMPTY', name: t('inStock') }
  ])

  if (!isSeller.value) {
    filters.value.push({ id: 'SELLER', name: t('shops') })
  }

  const selectedFilter = ref(filters.value[0])
  const selectFilter = (filter) => {
    selectedFilter.value = filter

    switch (filter.id) {
      case 'ALL':
        getAll()
        break
      case 'CATEGORIES':
        getMainCategories()
        getCategories()
        break
      case 'TAGS':
        getTags()
        break
      case 'SELLER':
        getShops()
        break
    }
  }

  const pageCount = ref(1)
  const params = reactive({
    page_size: 100,
    page: 1,
    search: '',
    sort_key: '',
    filter_key: '',
    filter_value: '',
    filter_name: ''
  })

  const counts = ref({
    close: 0,
    open: 0,
    waiting: 0,
    verified: 0,
    denied: 0,
    total: 0,
    out_of_stock: 0
  })

  const products = ref([])
  const getProducts = async () => {
    try {
      products.value = []

      const verifyType = moderationTypes.value.find((type) => type.key === route.query.status)?.id

      const { data, last_page, product_count } = await GET_PRODUCTS({
        lang: 'all',
        page_size: params.page_size,
        page: params.page,
        search: params.search,
        verify: verifyType,
        [selectedSort.value.key]: selectedSort.value.value,
        [params.filter_key]: params.filter_value
      })

      products.value = data || []
      pageCount.value = last_page
      counts.value = product_count
    } catch (error) {
      console.error(error)
    }
  }

  const getAll = () => {
    params.page = 1

    selectedCategory.value = null
    selectedTag.value = null
    selectedStatus.value = null
    selectedShop.value = null
    selectedStock.value = null

    params.filter_key = ''
    params.filter_value = ''
    params.filter_name = ''
    pushByParams()
  }

  const { categories, getCategories, getMainCategories } = useCategories()
  const selectedCategory = ref(null)
  const selectFilterCategory = (category) => {
    selectedCategory.value = category

    selectedTag.value = null
    selectedStatus.value = null
    selectedShop.value = null
    selectedStock.value = null

    params.page = 1
    params.filter_key = 'categories'
    params.filter_value = category.id
    params.filter_name = category.name

    pushByParams()
  }

  const { tags, getTags } = useTags()

  const selectedTag = ref(null)
  const selectFilterTag = (tag) => {
    selectedTag.value = tag

    selectedCategory.value = null
    selectedStatus.value = null
    selectedShop.value = null
    selectedStock.value = null

    params.page = 1
    params.filter_key = 'tags'
    params.filter_value = tag.id
    params.filter_name = tag.name

    pushByParams()
  }

  const statuses = computed(() => [
    { id: 0, name: t('close') },
    { id: 1, name: t('open') }
  ])

  const selectedStatus = ref(null)
  const selectFilterStatus = (status) => {
    selectedStatus.value = status

    selectedCategory.value = null
    selectedTag.value = null
    selectedShop.value = null
    selectedStock.value = null

    params.page = 1
    params.filter_key = 'visibility'
    params.filter_value = status.id
    params.filter_name = status.name

    pushByParams()
  }

  const stock = computed(() => [
    { id: 0, name: t('no') },
    { id: 1, name: t('yes') }
  ])

  const selectedStock = ref(null)
  const selectFilterStock = (stock) => {
    selectedStock.value = stock

    selectedStatus.value = null
    selectedCategory.value = null
    selectedTag.value = null
    selectedShop.value = null

    params.page = 1
    params.filter_key = 'filter_count_empty'
    params.filter_value = stock.id
    params.filter_name = stock.name

    pushByParams()
  }

  const { shops, getShops } = useShops()

  const selectedShop = ref(null)
  const selectFilterShop = (shop) => {
    selectedShop.value = shop

    selectedStatus.value = null
    selectedCategory.value = null
    selectedTag.value = null

    params.page = 1
    params.filter_key = 'seller'
    params.filter_value = shop.id
    params.filter_name = shop.name

    pushByParams()
  }

  const deleteProduct = async (id) => {
    try {
      await DELETE_PRODUCT({ id: selectedDeleteProductId.value })
      getProducts()
      toast.addToast({
        text: t('productRemoved')
      })
    } catch (error) {
      console.error(error)
    }
  }

  const selectedDeleteProductId = ref(null)
  const selectDeleteProduct = (id) => {
    selectedDeleteProductId.value = id
    showConfirmProductPopUp.value = true
  }

  const showConfirmProductPopUp = ref(false)
  const confirmSuccessProduct = () => {
    deleteProduct(selectedDeleteProductId.value)
    showConfirmProductPopUp.value = false
  }
  const confirmCancelProduct = () => {
    selectedDeleteProductId.value = null
    showConfirmProductPopUp.value = false
  }

  const openProduct = (product) => {
    if (product.option) {
      let optionParams = '?'
      optionParams += `main=${product.option[0].value.id}`
      if (product.option[1]) optionParams += `&secondary=${product.option[1].value.id}`

      router.push(`/product-multi/${product.id}${optionParams}`)
    } else {
      router.push(`/product/${product.id}`)
    }
  }

  const createProduct = () => {
    router.push('/product/new')
  }
  const createProductMulti = () => {
    router.push('/product-multi/new')
  }

  const updatePage = (newPage) => {
    params.page = newPage

    pushByParams()
  }

  const getVerifyTitle = (verify) => {
    return moderationTypes.value.find((type) => type.id === verify)?.name || ''
  }
  const getVerifyStyle = (verify) => {
    return moderationTypes.value.find((type) => type.id === verify)?.style || ''
  }

  const searchInterval = ref(null)
  const searchProduct = (text) => {
    params.search = text

    clearTimeout(searchInterval.value)
    searchInterval.value = setTimeout(() => {
      products.value = []
      params.page = 1

      pushByParams()
    }, 500)
  }

  const loading = ref(false)
  const updateProductVariant = async (form) => {
    try {
      loading.value = true
      await EDIT_PRODUCT_VARIANT({
        id: form.id,
        data: {
          code: form.code,
          price: form.old_price || form.price,
          old_price: form.old_price ? form.price : form.old_price,
          discount: form.discount,
          count: form.count,
          order: form.order
        }
      })
      closePopUpProductVariant()

      getProducts()

      toast.addToast({
        text: t('productSaved')
      })
    } catch (error) {
      toast.addToast({
        text: t('someProblemsWithServer'),
        status: 'error'
      })
      console.error(error)
    } finally {
      loading.value = false
    }
  }

  const selectedProductVariantId = ref(null)

  const selectProductVariant = (variant) => {
    selectedProductVariantId.value = variant.vid

    openPopUpProductVariant()
  }

  const showPopUpProductVariant = ref(false)
  const openPopUpProductVariant = () => {
    showPopUpProductVariant.value = true
  }
  const closePopUpProductVariant = () => {
    showPopUpProductVariant.value = false

    selectedProductVariantId.value = null
  }

  const getProductOptionName = (option) => {
    return `${option.option?.name?.[locale.value]}${
      option.value?.name?.[locale.value] ? `, ${option.value.name[locale.value]}` : ''
    }`
  }

  const pushByParams = () => {
    router.push({
      path: '/products',
      query: {
        ...params,
        sort_key: selectedSort.value?.key || '',
        sort_value: selectedSort.value?.value || ''
      }
    })
  }

  const getDataByRouteFilter = () => {
    const query = route.query

    params.page_size = Number(query.page_size) || 100
    params.page = Number(query.page) || 1
    params.search = query.search || ''
    params.status = query.status || ''
    params.filter_key = query.filter_key || ''
    params.filter_value = query.filter_value || ''
    params.filter_name = query.filter_name || ''

    if (query.sort_key) {
      const findSort =
        sorts.value.find((sort) => sort.key === query.sort_key && sort.value === query.sort_value) || null
      selectedSort.value = findSort
    }

    const findFilter = filters.value.find((filter) => filter.id === query.filter_key?.toUpperCase()) || filters.value[0]
    selectFilter(findFilter)

    switch (query.filter_key) {
      case 'categories':
        selectedCategory.value = {
          id: Number(query.filter_value),
          name: query.filter_name
        }
        break
      case 'tags':
        selectedTag.value = {
          id: Number(query.filter_value),
          name: query.filter_name
        }
        break
      case 'seller':
        selectedShop.value = {
          id: Number(query.filter_value),
          name: query.filter_name
        }
        break
      case 'shop':
        selectedShop.value = {
          id: Number(query.filter_value),
          name: query.filter_name
        }
        break
      case 'filter_count_empty':
        selectedStock.value = {
          id: Number(query.filter_value),
          name: query.filter_name
        }
        break
      case 'visibility':
        params.filter_key = 'status'
        selectedStatus.value = {
          id: Number(query.filter_value),
          name: query.filter_name
        }
        break
    }

    getProducts()
  }

  watch(
    () => route.fullPath,
    () => {
      getDataByRouteFilter()
    },
    { immediate: true }
  )
</script>

<template>
  <div class="page">
    <div class="page__wrapper">
      <div class="page__body _no-head">
        <div class="table">
          <div class="table__head flex-d-column">
            <div class="flex flex-sb" style="width: 100%">
              <div class="table__left">
                <m-button @click="createProduct" icon="addCircle" :title="t('add')" small />
                <m-button @click="createProductMulti" icon="addCircle" :title="t('addOption')" small />
              </div>
              <div class="table__right">
                <m-dropdown-dots
                  @select-item="selectSort"
                  :selected-item="selectedSort"
                  :items="sorts"
                  background
                  icon="sort"
                />
                <m-dropdown-dots @select-item="selectFilter" :items="filters" background icon="filter" />
                <m-dropdown
                  v-if="selectedFilter.id === 'CATEGORIES'"
                  @select-item="selectFilterCategory"
                  :selected-item="selectedCategory"
                  :items="categories"
                  background
                  :placeholder="t('categories')"
                  width="300"
                />
                <m-dropdown
                  v-if="selectedFilter.id === 'TAGS'"
                  @select-item="selectFilterTag"
                  :selected-item="selectedTag"
                  :items="tags"
                  @search="getTags"
                  background
                  searchable
                  :placeholder="t('tags')"
                  width="300"
                />
                <m-dropdown
                  v-if="selectedFilter.id === 'VISIBILITY'"
                  @select-item="selectFilterStatus"
                  :selected-item="selectedStatus"
                  :items="statuses"
                  background
                  :placeholder="t('status')"
                  width="200"
                />
                <m-dropdown
                  v-if="selectedFilter.id === 'FILTER_COUNT_EMPTY'"
                  @select-item="selectFilterStock"
                  :selected-item="selectedStock"
                  :items="stock"
                  background
                  :placeholder="t('inStock')"
                  width="200"
                />
                <m-dropdown
                  v-if="selectedFilter.id === 'SELLER'"
                  @select-item="selectFilterShop"
                  @search="getShops"
                  :selected-item="selectedShop"
                  :items="shops"
                  background
                  searchable
                  :placeholder="t('shops')"
                  width="200"
                />
                <m-text-filed
                  @updateValue="searchProduct"
                  :value="params.search"
                  background
                  :placeholder="t('search')"
                  width="260"
                  prepend-icon="search"
                />
              </div>
            </div>
            <div class="flex flex-sb" style="width: 100%">
              <div class="statuses-box">
                <div class="status status_success">
                  {{ t('open') }}
                  <span>{{ counts.open }}</span>
                </div>
                <div class="status status_danger">
                  {{ t('close') }}
                  <span>{{ counts.close }}</span>
                </div>
                <div class="status status_success">
                  {{ t('productsCount') }}
                  <span>{{ counts.total }}</span>
                </div>
                <div class="status status_return">
                  {{ t('outOfStock') }}
                  <span>{{ counts.out_of_stock }}</span>
                </div>
              </div>
              <div class="statuses-box _f-e">
                <div class="status status_return">
                  {{ t('underReview') }}
                  <span>{{ counts.waiting }}</span>
                </div>
                <div class="status status_success">
                  {{ t('confirmed') }}
                  <span>{{ counts.verified }}</span>
                </div>
                <div class="status status_danger">
                  {{ t('rejected') }}
                  <span>{{ counts.denied }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="table__body">
            <table>
              <thead>
                <tr>
                  <th width="1">№</th>
                  <th width="1">{{ t('photo') }}</th>
                  <th width="400">{{ t('name') }}</th>
                  <th>{{ t('option') }}</th>
                  <th>{{ t('price') }}</th>
                  <th>{{ t('products') }}</th>
                  <th>{{ t('views') }}</th>
                  <th>{{ t('sales') }}</th>
                  <th>{{ t('tags') }}</th>
                  <th>{{ t('status') }}</th>
                  <th width="1">{{ t('action') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(product, index) in products">
                  <td>{{ (params.page - 1) * params.page_size + index + 1 }}</td>
                  <td @click="selectProductVariant(product)" class="_cursor-pointer">
                    <m-image :image="product.image" width="80px" height="80px" />
                  </td>
                  <td @click="selectProductVariant(product)" class="_cursor-pointer">
                    <p>{{ product.name[locale] }}</p>
                    <span>{{ product.code }}</span>
                  </td>
                  <td @click="selectProductVariant(product)" class="_cursor-pointer">
                    <m-badge
                      v-for="option in product.option"
                      :title="getProductOptionName(option)"
                      styles="light"
                      outline
                      class="mb-5"
                    />
                  </td>
                  <td @click="selectProductVariant(product)" class="_cursor-pointer">
                    <p v-if="product.old_price" class="text-line-through">{{ product.old_price }}TMT</p>
                    <p>{{ product.price }}TMT</p>
                  </td>
                  <td @click="selectProductVariant(product)" class="_cursor-pointer">{{ product.count }}</td>
                  <td @click="selectProductVariant(product)" class="_cursor-pointer">{{ product.view }}</td>
                  <td @click="selectProductVariant(product)" class="_cursor-pointer">{{ product.sold }}</td>
                  <td @click="selectProductVariant(product)" class="_cursor-pointer">
                    <div class="products-tags">
                      <div v-for="tag in product.tag" class="mt-5" :style="`--color: ${tag.color}`">
                        {{ tag.name[locale] }}
                      </div>
                    </div>
                  </td>
                  <td @click="selectProductVariant(product)" class="_cursor-pointer">
                    <m-badge
                      :title="!!product.status ? t('open') : t('close')"
                      :styles="!!product.status ? 'success' : 'danger'"
                      outline
                    />
                    <m-badge
                      :title="getVerifyTitle(product.verify)"
                      :styles="getVerifyStyle(product.verify)"
                      class="mt-5"
                    />
                  </td>
                  <td>
                    <div class="flex gap-10">
                      <m-button @click="openProduct(product)" icon="edit" styles="success" only-icon />
                      <m-button
                        @click="selectDeleteProduct(product.id)"
                        icon="delete"
                        styles="danger"
                        outline
                        only-icon
                      />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="table__footer">
            <div class="table__footer-left"></div>
            <div class="table__footer-right">
              <m-pagination @click-page="updatePage" v-model="params.page" :page-count="pageCount" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <teleport to="#pop-up">
    <pop-up-confirm
      @yes="confirmSuccessProduct"
      @no="confirmCancelProduct"
      v-if="showConfirmProductPopUp"
      :title="t('confirmProductRemove')"
    />
    <pop-up-product-variant
      @save="updateProductVariant"
      @close="closePopUpProductVariant"
      :variant-id="selectedProductVariantId"
      :loading="loading"
      v-if="showPopUpProductVariant"
    />
  </teleport>
</template>

<style lang="scss" scoped>
  .products-tags {
    display: flex;
    flex-wrap: wrap;
    flex-wrap: wrap;
    gap: 4px;
    max-width: 200px;
    div {
      padding: 4px 8px;
      border: 1px solid var(--color, #000);
      border-radius: 4px;
      color: var(--color, #000);
      font-size: 12px;
    }
  }

  .statuses-box {
    display: flex;
    gap: 10px;
    margin-top: 10px;
    width: 100%;
    &._f-e {
      justify-content: flex-end;
    }
    .status {
      margin-left: 0;
    }
  }

  .status {
    margin-bottom: 5px;
    padding: 2px 2px 2px 10px;
    border: 1px solid var(--gray-900);
    border-radius: 20px;
    width: fit-content;
    font-size: 11px;
    display: flex;
    align-items: center;
    margin-left: auto;
    // .status_accepted
    &_accepted {
      background-color: var(--primary-100);
      border-color: var(--primary-600);
      color: var(--primary-600);
    }
    // .status_canceled
    &_canceled {
      background-color: var(--gray-100);
      border-color: var(--gray-600);
      color: var(--gray-600);
    }
    // .status_return
    &_return {
      background-color: var(--warning-100);
      border-color: var(--warning-600);
      color: var(--warning-600);
    }
    // .status_sending
    &_sending {
      background-color: var(--info-100);
      border-color: var(--info-600);
      color: var(--info-600);
    }
    // .status_success
    &_success {
      background-color: var(--success-100);
      border-color: var(--success-600);
      color: var(--success-600);
    }

    // .status_danger
    &_danger {
      background-color: var(--danger-100);
      border-color: var(--danger-600);
      color: var(--danger-600);
    }
    span {
      font-size: 12px;
      line-height: 12px;
      padding: 4px;
      background-color: var(--gray-600);
      color: var(--gray-100);
      border-radius: 20px;
      min-width: 20px;
      text-align: center;
      margin-left: 5px;
    }
  }
</style>

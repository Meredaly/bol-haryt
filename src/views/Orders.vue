<script setup>
  import { ref, watch, reactive, computed } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { useI18n } from 'vue-i18n'

  import MButton from '@/UI/MButton.vue'
  import MTextFiled from '@/UI/MTextFiled.vue'
  import MPagination from '@/UI/MPagination.vue'
  import MDropdownDots from '@/UI/MDropdownDots'
  import MDropdown from '@/UI/MDropdown'
  import MDatepicker from '@/UI/MDatepicker.vue'
  import PopUpConfirm from '@/components/popUps/PopUpConfirm.vue'

  import { GET_ORDERS, DELETE_ORDER } from '@/api/order.api'

  import { getDate } from '@/helpers/date'
  import { normalizePhone } from '@/helpers/normalize'

  import { useShops } from '@/composables/productShops'

  const { t } = useI18n()

  const router = useRouter()
  const route = useRoute()

  const statuses = ref([
    { id: 'AC', key: 'accepted', count: 0, name: 'accepted' },
    { id: 'CA', key: 'canceled', count: 0, name: 'canceled' },
    { id: 'RE', key: 'return', count: 0, name: 'return' },
    { id: 'SE', key: 'sending', count: 0, name: 'dispatch' },
    { id: 'SU', key: 'success', count: 0, name: 'completed' }
  ])

  const pageCount = ref(1)
  const params = reactive({
    page_size: 100,
    page: 1,
    search: '',
    start_date: '',
    end_date: '',
    status: '',
    seller: '',
    created: ''
  })

  const orders = ref([])
  const totalPrice = ref(0)

  const getOrders = async () => {
    try {
      orders.value = []
      const { data, last_page } = await GET_ORDERS({
        params: {
          ...params,
          [selectedSort.value.key]: selectedSort.value.value
        }
      })

      orders.value = data.order_list || []
      totalPrice.value = data.total_price
      pageCount.value = last_page

      statuses.value.forEach((status) => {
        status.count = data[status.id] || 0
      })
    } catch (error) {
      console.error(error)
    }
  }

  const selectedDeleteOrderId = ref(null)
  const selectDeleteOrder = (id) => {
    selectedDeleteOrderId.value = id
    showConfirmOrderPopUp.value = true
  }

  const showConfirmOrderPopUp = ref(false)
  const confirmSuccessOrder = () => {
    deleteOrder(selectedDeleteOrderId.value)
    showConfirmOrderPopUp.value = false
  }
  const confirmCancelOrder = () => {
    selectedDeleteOrderId.value = null
    showConfirmOrderPopUp.value = false
  }

  const deleteOrder = async (id) => {
    try {
      await DELETE_ORDER({ id: id })
      getOrders()
    } catch (error) {
      console.error(error)
    }
  }

  const openOrder = (product) => {
    router.push(`/order/${product.id}`)
  }

  const sorts = computed(() => [
    { id: 1, key: 'created', value: 'dec', name: t('createdAsc') },
    { id: 2, key: 'created', value: 'asc', name: t('createdDec') }
  ])

  const selectedSort = ref(sorts.value[0])
  const selectSort = (sort) => {
    selectedSort.value = sort

    pushByParams()
  }

  const filters = computed(() => [
    { id: 'ALL', name: t('all') },
    { id: 'SELLER', name: t('shops') }
  ])

  const selectedFilter = ref(filters.value[0])
  const selectFilter = (filter) => {
    selectedFilter.value = filter

    if (filter.id === 'ALL') {
      params.page = 1
      params.seller = ''
      params.seller_name = ''
      selectedShop.value = null

      pushByParams()
    }
    if (filter.id === 'SELLER') {
      getShops()
    }
  }

  const { shops, getShops } = useShops()

  const selectedShop = ref(null)
  const selectFilterShop = (shop) => {
    selectedShop.value = shop
    params.seller = shop.id
    pushByParams()
  }

  const updatePage = (newPage) => {
    params.page = newPage
    pushByParams()
  }

  const searchInterval = ref(null)
  const searchOrder = (text) => {
    params.search = text
    clearTimeout(searchInterval.value)
    searchInterval.value = setTimeout(() => {
      orders.value = []
      params.page = 1
      pushByParams()
    }, 500)
  }

  const selectStartDate = (date) => {
    params.start_date = date
    params.page = 1

    pushByParams()
  }

  const selectEndDate = (date) => {
    params.end_date = date
    params.page = 1

    pushByParams()
  }

  const pushByParams = () => {
    router.push({
      path: '/orders',
      query: {
        ...params,
        seller_name: selectedShop.value?.name || '',
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
    params.start_date = query.start_date || ''
    params.end_date = query.end_date || ''
    params.status = query.status || ''
    if (query.sort_key) {
      const findSort =
        sorts.value.find((sort) => sort.key === query.sort_key && sort.value === query.sort_value) || null
      selectedSort.value = findSort
    }

    if (query.seller) {
      params.seller = query.seller
      selectedShop.value = {
        id: Number(query.seller),
        name: query.seller_name
      }

      selectedFilter.value = filters.value[1]
      getShops()
    } else {
      params.seller = ''
    }

    getOrders()
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
                <div class="total-price">
                  {{ t('totalPrice') }}: <span v-if="totalPrice">{{ totalPrice }}</span>
                </div>
              </div>
              <div class="table__right">
                <div class="flex flex-y-center gap-10">
                  <m-datepicker @selectDate="selectStartDate" v-model="params.start_date" width="130" />
                  <span>-</span>
                  <m-datepicker @selectDate="selectEndDate" v-model="params.end_date" width="130" />
                </div>
                <m-dropdown-dots
                  @select-item="selectSort"
                  :selected-item="selectedSort"
                  :items="sorts"
                  background
                  icon="sort"
                />
                <m-dropdown-dots @select-item="selectFilter" :items="filters" background icon="filter" />
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
                  @updateValue="searchOrder"
                  :value="params.search"
                  :placeholder="t('search')"
                  width="260"
                  prepend-icon="search"
                  background
                />
              </div>
            </div>
            <div class="statuses-box">
              <div v-for="status in statuses" :class="['status', `status_${status.key}`]">
                {{ t(status.name) }}
                <span>{{ status.count }}</span>
              </div>
            </div>
          </div>
          <div class="table__body">
            <table>
              <thead>
                <tr>
                  <th width="1">№</th>
                  <th width="1">{{ t('orderNumber') }}</th>
                  <th>{{ t('products') }}</th>
                  <th>{{ t('totalPrice') }}</th>
                  <th>{{ t('date') }}</th>
                  <th>{{ t('phoneNumber') }}</th>
                  <th width="300">{{ t('note') }}</th>
                  <th>{{ t('location') }}</th>
                  <th>{{ t('transportation') }}</th>
                  <th>{{ t('statuses') }}</th>
                  <th width="1">{{ t('action') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(order, index) in orders" class="_cursor-pointer">
                  <td @click="openOrder(order)">{{ (params.page - 1) * params.page_size + index + 1 }}</td>
                  <td @click="openOrder(order)">
                    <p>{{ order.code }}</p>
                  </td>
                  <td @click="openOrder(order)">{{ order.products }}</td>
                  <td @click="openOrder(order)">{{ order.total_price + order.shipping?.shipping_price || 0 }} TMT</td>
                  <td @click="openOrder(order)">{{ getDate(order.created_at) }}</td>
                  <td @click="openOrder(order)">{{ normalizePhone(order.number) }}</td>
                  <td @click="openOrder(order)">{{ order.address }}</td>
                  <td @click="openOrder(order)">{{ order.region?.name }}</td>
                  <td @click="openOrder(order)">{{ order.shipping?.shipping }}</td>
                  <td @click="openOrder(order)">
                    <div v-if="order.status.AC" class="status status_accepted">
                      {{ t('accepted') }} <span>{{ order.status.AC }}</span>
                    </div>
                    <div v-if="order.status.CA" class="status status_canceled">
                      {{ t('canceled') }} <span> {{ order.status.CA }}</span>
                    </div>
                    <div v-if="order.status.RE" class="status status_return">
                      {{ t('return') }} <span>{{ order.status.RE }}</span>
                    </div>
                    <div v-if="order.status.SE" class="status status_sending">
                      {{ t('dispatch') }} <span>{{ order.status.SE }}</span>
                    </div>
                    <div v-if="order.status.SU" class="status status_success">
                      {{ t('completed') }} <span>{{ order.status.SU }}</span>
                    </div>
                  </td>
                  <td>
                    <m-button @click="selectDeleteOrder(order.id)" icon="delete" styles="danger" outline only-icon />
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
      @yes="confirmSuccessOrder"
      @no="confirmCancelOrder"
      v-if="showConfirmOrderPopUp"
      :title="t('deleteOrderText')"
    />
  </teleport>
</template>

<style lang="scss" scoped>
  .total-price {
    font-size: 24px;
    font-weight: 500;
  }
  .statuses-box {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 10px;
    width: 100%;
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

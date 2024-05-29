<script setup>
  import { ref, watch, reactive } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { useI18n } from 'vue-i18n'

  import MTextFiled from '@/UI/MTextFiled.vue'
  import MPagination from '@/UI/MPagination.vue'
  import MDropdownDots from '@/UI/MDropdownDots'
  import MDatepicker from '@/UI/MDatepicker.vue'
  import MImage from '@/UI/MImage.vue'
  import MBadge from '@/UI/MBadge.vue'

  import { getDate } from '@/helpers/date'
  import { GET_SELLER_ORDERS } from '@/api/order.api'

  const router = useRouter()
  const route = useRoute()

  const { t, locale } = useI18n()

  const statuses = ref([
    { id: 'AC', key: 'accepted', count: 0, name: 'accepted' },
    { id: 'CA', key: 'canceled', count: 0, name: 'canceled' },
    { id: 'RE', key: 'return', count: 0, name: 'return' },
    { id: 'SE', key: 'sending', count: 0, name: 'dispatch' },
    { id: 'SU', key: 'success', count: 0, name: 'completed' }
  ])
  const statusClasses = ref({
    AC: { key: 'accepted', class: 'status_accepted', name: 'accepted' },
    CA: { key: 'canceled', class: 'status_canceled', name: 'canceled' },
    RE: { key: 'return', class: 'status_return', name: 'return' },
    SE: { key: 'sending', class: 'status_sending', name: 'dispatch' },
    SU: { key: 'success', class: 'status_success', name: 'completed' }
  })

  const pageCount = ref(1)
  const params = reactive({
    page_size: 100,
    page: 1,
    search: '',
    start_date: '',
    end_date: '',
    status: '',
    created: ''
  })

  const orders = ref([])
  const totalPrice = ref(0)

  const getOrders = async () => {
    try {
      orders.value = []
      const { data, last_page } = await GET_SELLER_ORDERS({
        params: {
          ...params,
          [selectedSort.value.key]: selectedSort.value.value,
          lang: 'all'
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
  const sorts = ref([
    { id: 1, key: 'created', value: 'dec', name: t('createdAsc') },
    { id: 2, key: 'created', value: 'asc', name: t('createdDec') }
  ])

  const selectedSort = ref(sorts.value[0])
  const selectSort = (sort) => {
    selectedSort.value = sort
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
      path: '/orders-seller',
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
    params.start_date = query.start_date || ''
    params.end_date = query.end_date || ''
    params.status = query.status || ''
    if (query.sort_key) {
      const findSort = sorts.value.find((sort) => sort.key === query.sort_key && sort.value === query.sort_value)
      findSort && selectSort(findSort)
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

  const getOptionName = (option) => {
    return `${option.option?.name?.[locale.value]}${
      option.value?.name?.[locale.value] ? `, ${option.value.name[locale.value]}` : ''
    }`
  }
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
                  <th width="170">{{ t('orderNumber') }}</th>
                  <th width="170">{{ t('date') }}</th>
                  <th>{{ t('products') }}</th>
                  <th width="100">{{ t('price') }}</th>
                  <th width="120">{{ t('count') }}</th>
                  <th width="150">{{ t('totalPrice') }}</th>
                  <th width="1">{{ t('statuses') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(order, index) in orders">
                  <td>{{ (params.page - 1) * params.page_size + index + 1 }}</td>
                  <td>{{ order.order_code }}</td>
                  <td>{{ getDate(order.created_at) }}</td>
                  <td>
                    <div class="product">
                      <div class="product__image">
                        <m-image :image="order.variant?.image?.thumbnail" width="50px" height="80px" />
                      </div>
                      <div class="product__content">
                        <div class="product__name">{{ order.variant?.name[locale] }}</div>
                        <div class="product__code">{{ order.variant?.code }}</div>
                        <div class="product__options">
                          <m-badge
                            v-for="option in order.variant?.options"
                            :title="getOptionName(option)"
                            styles="dark"
                            outline
                          />
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>{{ order.price }}</td>
                  <td>{{ order.count }}</td>
                  <td>{{ order.total_price }}</td>
                  <td>
                    <div v-if="order.status" :class="['status', statusClasses[order.status].class]">
                      {{ t(statusClasses[order.status].name) }}
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
    padding: 4px 10px;
    border: 1px solid var(--gray-900);
    border-radius: 20px;
    width: fit-content;
    font-size: 13px;
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

  .product {
    display: flex;
    gap: 10px;
    // .product__image
    &__image {
    }
    // .product__content
    &__content {
    }
    // .product__name
    &__name {
      font-size: 14px;
      font-weight: 500;
    }
    // .product__code
    &__code {
      margin-top: 6px;
    }
    // .product__options
    &__options {
      margin-top: 6px;
      display: flex;
      gap: 10px;
    }
  }
</style>

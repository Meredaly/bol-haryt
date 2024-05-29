<script setup>
  import { ref, watch, reactive } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { useI18n } from 'vue-i18n'

  import MButton from '@/UI/MButton.vue'
  import MPagination from '@/UI/MPagination.vue'
  import MDropdownDots from '@/UI/MDropdownDots'
  import MDropdown from '@/UI/MDropdown'
  import MDatepicker from '@/UI/MDatepicker.vue'

  import PopUpWithdrawer from '@/components/popUps/PopUpWithdrawer.vue'
  import PopUpConfirm from '@/components/popUps/PopUpConfirm.vue'

  import { GET_WITHDRAWALS, ADD_WITHDRAWER, DELETE_WITHDRAWER } from '@/api/withdrawer.api'
  import { getDate } from '@/helpers/date'
  import { useShops } from '@/composables/productShops'

  import { useToast } from '@/store/toast'
  import { useAuth } from '@/store/auth'

  const router = useRouter()
  const route = useRoute()
  const { t } = useI18n()

  const toast = useToast()
  const auth = useAuth()

  const isSeller = ref(auth.role === 'SELLER')

  const pageCount = ref(1)
  const params = reactive({
    page_size: 100,
    page: 1,
    start_date: '',
    end_date: '',
    seller: '',
    time: ''
  })

  const withdrawals = ref([])
  const getWithdrawals = async () => {
    try {
      const { data, last_page } = await GET_WITHDRAWALS({
        params: params
      })

      withdrawals.value = data || []

      pageCount.value = last_page
    } catch (error) {
      console.error(error)
    }
  }

  const loading = ref(false)
  const saveWithdrawer = async ({ form }) => {
    try {
      loading.value = true
      const { data } = await ADD_WITHDRAWER({ data: form })
      withdrawals.value.unshift(data)
      closePopUpWithdrawer()
      toast.addToast({
        text: `${t('withdrawer.withdrawerSaved')}`
      })
    } catch (error) {
      console.error(error)
      toast.addToast({
        text: `${t('categoryLocales.serverProblems')}`,
        status: 'error'
      })
    } finally {
      loading.value = false
    }
  }

  const deleteWithdrawer = async (id) => {
    try {
      await DELETE_WITHDRAWER({ id })

      getWithdrawals()

      toast.addToast({
        text: `${t('withdrawer.withdrawerDeleted')}`
      })
    } catch (error) {
      console.error(error)
    }
  }

  const selectedDeleteId = ref(null)
  const selectDelete = (id) => {
    selectedDeleteId.value = id
    showConfirmPopUp.value = true
  }

  const showConfirmPopUp = ref(false)
  const confirmSuccess = () => {
    deleteWithdrawer(selectedDeleteId.value)
    showConfirmPopUp.value = false
  }
  const confirmCancel = () => {
    selectedDeleteId.value = null
    showConfirmPopUp.value = false
  }

  const sorts = ref([
    { id: 13, key: 'time', value: 'asc', name: `${t('createdAsc')}` },
    { id: 14, key: 'time', value: 'dec', name: `${t('createdDec')}` }
  ])

  const selectedSort = ref(sorts.value[0])
  const selectSort = (sort) => {
    selectedSort.value = sort

    params.time = sort.value

    pushByParams()
  }

  const filters = ref([
    { id: 'ALL', name: `${t('all')}` },
    { id: 'SELLER', name: `${t('shops')}` }
  ])

  const selectedFilter = ref(filters.value[0])
  const selectFilter = (filter) => {
    selectedFilter.value = filter

    if (filter.id === 'ALL') {
      params.page = 1
      params.seller = ''
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

  const updatePage = (newPage) => {
    params.page = newPage
    pushByParams()
  }

  const showPopUpWithdrawer = ref(false)
  const openPopUpWithdrawer = () => {
    showPopUpWithdrawer.value = true
  }
  const closePopUpWithdrawer = () => {
    showPopUpWithdrawer.value = false
  }

  const pushByParams = () => {
    router.push({
      path: '/withdrawer',
      query: {
        ...params,
        seller_name: selectedShop.value?.name || ''
      }
    })
  }

  const getDataByRouteFilter = () => {
    const query = route.query

    params.page_size = Number(query.page_size) || 100
    params.page = Number(query.page) || 1
    params.start_date = query.start_date || ''
    params.end_date = query.end_date || ''

    if (query.time) {
      const findSort = sorts.value.find((sort) => sort.value === query.time)
      findSort && selectSort(findSort)
    }

    if (query.seller) {
      params.seller = Number(query.seller)
      selectedShop.value = {
        id: Number(query.seller),
        name: query.seller_name
      }
      getShops()

      selectedFilter.value = filters.value[1]
    } else {
      params.seller = ''
    }
    getWithdrawals()
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
          <div class="table__head">
            <div class="table__left">
              <m-button v-if="!isSeller" @click="openPopUpWithdrawer" icon="addCircle" :title="t('add')" small />
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
              <m-dropdown-dots v-if="!isSeller" @select-item="selectFilter" :items="filters" background icon="filter" />
              <m-dropdown
                v-if="selectedFilter.id === 'SELLER'"
                @select-item="selectFilterShop"
                @search="getShops"
                :selected-item="selectedShop"
                :items="shops"
                background
                searchable
                :placeholder="t('shops')"
                width="300"
              />
            </div>
          </div>
          <div class="table__body">
            <table>
              <thead>
                <tr>
                  <th width="1">№</th>
                  <th>{{ t('withdrawer.paid') }}</th>
                  <th>{{ t('date') }}</th>
                  <th v-if="!isSeller">{{ t('shop') }}</th>
                  <th v-if="!isSeller">{{ t('withdrawer.aboutOwner') }}</th>
                  <th>{{ t('shopLocales.wallet') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(withdrawer, index) in withdrawals">
                  <td>{{ (params.page - 1) * params.page_size + index + 1 }}</td>
                  <td>{{ withdrawer.paid }} TMT</td>
                  <td>{{ getDate(withdrawer.time) }}</td>
                  <td v-if="!isSeller">{{ withdrawer.seller?.market_name }}</td>
                  <td v-if="!isSeller">
                    <p>{{ withdrawer.seller?.name }}</p>
                    <p class="mt-5">{{ withdrawer.seller?.number }}</p>
                  </td>
                  <td>{{ withdrawer.seller?.wallet }} TMT</td>
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
    <pop-up-withdrawer
      @save="saveWithdrawer"
      @close="closePopUpWithdrawer"
      :loading="loading"
      v-if="showPopUpWithdrawer"
    />
    <pop-up-confirm
      @no="confirmCancel"
      @yes="confirmSuccess"
      :title="t('withdrawer.deletedWithdrawerText')"
      v-if="showConfirmPopUp"
    />
  </teleport>
</template>

<style lang="scss" scoped>
  .total-price {
    font-size: 24px;
    font-weight: 500;
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

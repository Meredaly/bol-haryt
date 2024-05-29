<script setup>
  import { ref, reactive, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useI18n } from 'vue-i18n'

  import MButton from '@/UI/MButton.vue'
  import MImage from '@/UI/MImage.vue'
  import MTextFiled from '@/UI/MTextFiled.vue'
  import MPagination from '@/UI/MPagination.vue'
  import MBadge from '@/UI/MBadge.vue'
  import PopUpShop from '@/components/popUps/PopUpShop.vue'
  import PopUpConfirm from '@/components/popUps/PopUpConfirm.vue'

  import { GET_SHOPS, ADD_SHOP, DELETE_SHOP, EDIT_SHOP } from '@/api/shop.api'

  import { useToast } from '@/store/toast'

  const toast = useToast()

  const route = useRoute()
  const router = useRouter()
  const { t } = useI18n()

  const pageCount = ref(1)
  const params = reactive({
    page: 1,
    page_size: 100,
    search: ''
  })

  const shops = ref([])
  const getShops = async () => {
    try {
      const { data, last_page } = await GET_SHOPS({
        params: {
          page_size: params.page_size,
          page: params.page,
          search: params.search
        }
      })

      shops.value = data || []

      pageCount.value = last_page
    } catch (error) {
      console.error(error)
    }
  }

  const loading = ref(false)
  const saveShop = async ({ id, form }) => {
    try {
      loading.value = true
      if (id) {
        await EDIT_SHOP({ id, data: form })
      } else {
        await ADD_SHOP(form)
      }
      closePopUpShop()
      getShops()

      toast.addToast({
        text: `${t('shopLocales.shopSaved')}`
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

  const deleteShop = async (id) => {
    try {
      await DELETE_SHOP({ id })

      getShops()
    } catch (error) {
      console.error(error)
    }
  }

  const selectedShop = ref(null)
  const selectShop = (brand) => {
    selectedShop.value = brand
    openPopUpShop()
  }

  const selectedDeleteId = ref(null)
  const selectDelete = (id) => {
    selectedDeleteId.value = id
    showConfirmPopUp.value = true
  }

  const showConfirmPopUp = ref(false)
  const confirmSuccess = () => {
    deleteShop(selectedDeleteId.value)
    showConfirmPopUp.value = false
  }
  const confirmCancel = () => {
    selectedDeleteId.value = null
    showConfirmPopUp.value = false
  }

  const showPopUpShop = ref(false)
  const openPopUpShop = () => {
    showPopUpShop.value = true
  }
  const closePopUpShop = () => {
    showPopUpShop.value = false
    selectedShop.value = null
  }

  const searchInterval = ref(null)
  const searchShop = (text) => {
    params.search = text

    clearTimeout(searchInterval.value)
    searchInterval.value = setTimeout(() => {
      params.page = 1

      pushByParams()
    }, 500)
  }

  const updatePage = (page) => {
    params.page = page

    pushByParams()
  }

  const pushByParams = () => {
    router.push({
      path: '/shops',
      query: params
    })
  }

  const getDataByRouteFilter = () => {
    const query = route.query

    params.page_size = Number(query.page_size) || 100
    params.page = Number(query.page) || 1
    params.search = query.search

    getShops()
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
              <m-button @click="openPopUpShop" icon="addCircle" :title="t('add')" small />
            </div>
            <div class="table__right">
              <m-text-filed
                @updateValue="searchShop"
                :value="params.search"
                background
                :placeholder="t('search')"
                width="260"
                prepend-icon="search"
              />
            </div>
          </div>
          <div class="table__body">
            <table>
              <thead>
                <tr>
                  <th width="1">№</th>
                  <th width="1">{{ t('shopLocales.logotip') }}</th>
                  <th>{{ t('name') }}</th>
                  <th>{{ t('shopLocales.owner') }}</th>
                  <th>{{ t('phoneNumber') }}</th>
                  <th>{{ t('email') }}</th>
                  <th>{{ t('commission') }}</th>
                  <th>{{ t('shopLocales.wallet') }}</th>
                  <th>{{ t('shopLocales.deliveryTime') }}</th>
                  <th width="1">{{ t('status') }}</th>
                  <th width="1">{{ t('action') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(shop, index) in shops" :key="shop.id">
                  <td @click="selectShop(shop)" class="_cursor-pointer">
                    {{ (params.page - 1) * params.page_size + index + 1 }}
                  </td>
                  <td @click="selectShop(shop)" class="_cursor-pointer">
                    <m-image :image="shop.logo" width="40px" height="40px" circle />
                  </td>
                  <td @click="selectShop(shop)" class="_cursor-pointer">{{ shop.market_name }}</td>
                  <td @click="selectShop(shop)" class="_cursor-pointer">{{ shop.name }}</td>
                  <td @click="selectShop(shop)" class="_cursor-pointer">{{ shop.number }}</td>
                  <td @click="selectShop(shop)" class="_cursor-pointer">{{ shop.email }}</td>
                  <td @click="selectShop(shop)" class="_cursor-pointer">{{ shop.fee }}%</td>
                  <td @click="selectShop(shop)" class="_cursor-pointer">{{ shop.wallet }} TMT</td>
                  <td @click="selectShop(shop)" class="_cursor-pointer">{{ shop.shipping_time }}</td>
                  <td @click="selectShop(shop)" class="_cursor-pointer">
                    <m-badge
                      :title="!!shop.status ? `${t('open')}` : `${t('closed')}`"
                      :styles="!!shop.status ? 'success' : 'danger'"
                      outline
                    />
                  </td>
                  <td>
                    <m-button @click="selectDelete(shop.id)" icon="delete" styles="danger" outline only-icon />
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
    <pop-up-shop
      @save="saveShop"
      @close="closePopUpShop"
      :item="selectedShop"
      :loading="loading"
      v-if="showPopUpShop"
    />
    <pop-up-confirm
      @no="confirmCancel"
      @yes="confirmSuccess"
      :title="t('shopLocales.deleteShopText')"
      v-if="showConfirmPopUp"
    />
  </teleport>
</template>

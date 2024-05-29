<script setup>
  import { ref, reactive, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useI18n } from 'vue-i18n'

  import MButton from '@/UI/MButton.vue'
  import MImage from '@/UI/MImage.vue'
  import MTextFiled from '@/UI/MTextFiled.vue'
  import MPagination from '@/UI/MPagination.vue'
  import PopUpBrand from '@/components/popUps/PopUpBrand.vue'
  import PopUpConfirm from '@/components/popUps/PopUpConfirm.vue'

  import { GET_BRANDS, ADD_BRAND, EDIT_BRAND, DELETE_BRAND } from '@/api/brand.api'

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

  const brands = ref([])
  const getBrands = async () => {
    try {
      const { data, last_page } = await GET_BRANDS({
        params: {
          page_size: params.page_size,
          page: params.page,
          search: params.search
        }
      })

      brands.value = data || []

      pageCount.value = last_page
    } catch (error) {
      console.error(error)
    }
  }

  const loading = ref(false)
  const saveBrand = async ({ id, form }) => {
    try {
      loading.value = true
      if (id) {
        await EDIT_BRAND({ id, data: form })
      } else {
        await ADD_BRAND(form)
      }
      closePopUpBrand()
      getBrands()

      toast.addToast({
        text: `${t('brands.brandSaved')}`
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

  const deleteBrand = async (id) => {
    try {
      await DELETE_BRAND({ id })
      getBrands()
    } catch (error) {
      console.error(error)
    }
  }

  const selectedBrand = ref(null)
  const selectBrand = (brand) => {
    selectedBrand.value = brand
    openPopUpBrand()
  }

  const selectedDeleteId = ref(null)
  const selectDelete = (id) => {
    selectedDeleteId.value = id
    showConfirmPopUp.value = true
  }

  const showConfirmPopUp = ref(false)
  const confirmSuccess = () => {
    deleteBrand(selectedDeleteId.value)
    showConfirmPopUp.value = false
  }
  const confirmCancel = () => {
    selectedDeleteId.value = null
    showConfirmPopUp.value = false
  }

  const showPopUpBrand = ref(false)
  const openPopUpBrand = () => {
    showPopUpBrand.value = true
  }
  const closePopUpBrand = () => {
    showPopUpBrand.value = false

    selectedBrand.value = null
  }

  const searchInterval = ref(null)
  const searchBrand = (text) => {
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
      path: '/brands',
      query: params
    })
  }

  const getDataByRouteFilter = () => {
    const query = route.query

    params.page_size = Number(query.page_size) || 100
    params.page = Number(query.page) || 1
    params.search = query.search

    getBrands()
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
              <m-button @click="openPopUpBrand" icon="addCircle" :title="t('add')" small />
            </div>
            <div class="table__right">
              <m-text-filed
                @updateValue="searchBrand"
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
                  <th width="1">{{ t('photo') }}</th>
                  <th>{{ t('name') }}</th>
                  <th width="1">{{ t('action') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(brand, index) in brands">
                  <td @click="selectBrand(brand)" class="_cursor-pointer">
                    {{ (params.page - 1) * params.page_size + index + 1 }}
                  </td>
                  <td @click="selectBrand(brand)" class="_cursor-pointer">
                    <m-image :image="brand.logo" width="40px" height="40px" circle />
                  </td>
                  <td @click="selectBrand(brand)" class="_cursor-pointer">{{ brand.name }}</td>
                  <td>
                    <m-button @click="selectDelete(brand.id)" icon="delete" styles="danger" outline only-icon />
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
    <pop-up-brand
      @save="saveBrand"
      @close="closePopUpBrand"
      :item="selectedBrand"
      :loading="loading"
      v-if="showPopUpBrand"
    />
    <pop-up-confirm
      @no="confirmCancel"
      @yes="confirmSuccess"
      :title="t('brands.deleteBrandText')"
      v-if="showConfirmPopUp"
    />
  </teleport>
</template>

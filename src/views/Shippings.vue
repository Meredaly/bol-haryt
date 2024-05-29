<script setup>
  import { ref, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useI18n } from 'vue-i18n'

  import MButton from '@/UI/MButton.vue'
  import MTextFiled from '@/UI/MTextFiled.vue'
  import PopUpShipping from '@/components/popUps/PopUpShipping.vue'
  import PopUpConfirm from '@/components/popUps/PopUpConfirm.vue'

  import { GET_SHIPPINGS, ADD_SHIPPING, EDIT_SHIPPING, DELETE_SHIPPING } from '@/api/shipping.api'

  import { useToast } from '@/store/toast'

  const route = useRoute()
  const router = useRouter()
  const { t } = useI18n()

  const toast = useToast()

  const search = ref('')

  const shippings = ref([])
  const getShippings = async () => {
    try {
      const { data } = await GET_SHIPPINGS({
        params: {
          search: search.value
        }
      })

      shippings.value = data || []
    } catch (error) {
      console.error(error)
    }
  }

  const loading = ref(false)
  const saveShipping = async ({ id, form }) => {
    try {
      loading.value = true
      if (id) {
        await EDIT_SHIPPING({ id, data: form })
      } else {
        await ADD_SHIPPING(form)
      }
      closePopUpShipping()
      getShippings()

      toast.addToast({
        text: `${t('shippings.shippingSaved')}`
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

  const deleteUser = async (id) => {
    try {
      await DELETE_SHIPPING({ id })
      getShippings()
    } catch (error) {
      console.error(error)
    }
  }

  const selectedShipping = ref(null)
  const selectShipping = (brand) => {
    selectedShipping.value = brand
    openPopUpShipping()
  }

  const selectedDeleteId = ref(null)
  const selectDelete = (id) => {
    selectedDeleteId.value = id
    showConfirmPopUp.value = true
  }

  const showConfirmPopUp = ref(false)
  const confirmSuccess = () => {
    deleteUser(selectedDeleteId.value)
    showConfirmPopUp.value = false
  }
  const confirmCancel = () => {
    selectedDeleteId.value = null
    showConfirmPopUp.value = false
  }

  const showPopUpShipping = ref(false)
  const openPopUpShipping = () => {
    showPopUpShipping.value = true
  }
  const closePopUpShipping = () => {
    showPopUpShipping.value = false

    selectedShipping.value = null
  }

  const searchInterval = ref(null)
  const searchShipping = (text) => {
    search.value = text
    clearTimeout(searchInterval.value)
    searchInterval.value = setTimeout(() => {
      pushByParams()
    }, 500)
  }

  const pushByParams = () => {
    router.push({
      path: '/shippings',
      query: {
        search: search.value
      }
    })
  }

  const getDataByRouteFilter = () => {
    const query = route.query

    search.value = query.search

    getShippings()
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
              <m-button @click="openPopUpShipping" icon="addCircle" :title="t('add')" small />
            </div>
            <div class="table__right">
              <m-text-filed
                @updateValue="searchShipping"
                :value="search"
                background
                :placeholder="t('search')"
                width="260"
                prepend-icon="search"
              />
            </div>
          </div>
          <div class="table__body _no-footer">
            <table>
              <thead>
                <tr>
                  <th width="1">№</th>
                  <th>{{ t('name') }} (RU)</th>
                  <th>{{ t('name') }} (TM)</th>
                  <th>{{ t('price') }} (TMT)</th>
                  <th>{{ t('shopLocales.deliveryTime') }}</th>
                  <th width="1">{{ t('action') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(shipping, index) in shippings">
                  <td @click="selectShipping(shipping)" class="_cursor-pointer">{{ index + 1 }}</td>
                  <td @click="selectShipping(shipping)" class="_cursor-pointer">{{ shipping.name.ru }}</td>
                  <td @click="selectShipping(shipping)" class="_cursor-pointer">{{ shipping.name.tm }}</td>
                  <td @click="selectShipping(shipping)" class="_cursor-pointer">{{ shipping.price }}</td>
                  <td @click="selectShipping(shipping)" class="_cursor-pointer">{{ shipping.time }}</td>
                  <td>
                    <m-button @click="selectDelete(shipping.id)" icon="delete" styles="danger" outline only-icon />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
  <teleport to="#pop-up">
    <pop-up-shipping
      @save="saveShipping"
      @close="closePopUpShipping"
      :item="selectedShipping"
      :loading="loading"
      v-if="showPopUpShipping"
    />
    <pop-up-confirm
      @no="confirmCancel"
      @yes="confirmSuccess"
      title="Вы действительно хотите удалить тип доставки"
      v-if="showConfirmPopUp"
    />
  </teleport>
</template>

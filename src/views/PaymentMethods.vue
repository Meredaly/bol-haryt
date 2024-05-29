<script setup>
  import { ref, reactive, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useI18n } from 'vue-i18n'

  import MButton from '@/UI/MButton.vue'
  import MTextFiled from '@/UI/MTextFiled.vue'
  import PopUpPaymentMethod from '@/components/popUps/PopUpPaymentMethod.vue'
  import PopUpConfirm from '@/components/popUps/PopUpConfirm.vue'

  import {
    GET_PAYMENT_METHODS,
    ADD_PAYMENT_METHOD,
    EDIT_PAYMENT_METHOD,
    DELETE_PAYMENT_METHOD
  } from '@/api/payment-methods.api'

  import { useToast } from '@/store/toast'

  const toast = useToast()

  const route = useRoute()
  const router = useRouter()
  const { t, locale } = useI18n()

  const params = reactive({
    search: ''
  })

  const paymentMethods = ref([])
  const getPaymentMethods = async () => {
    try {
      const { data } = await GET_PAYMENT_METHODS({
        params: {
          search: params.search,
          lang: 'all'
        }
      })

      paymentMethods.value = data || []
    } catch (error) {
      console.error(error)
    }
  }

  const loading = ref(false)
  const savePaymentMethod = async ({ id, form }) => {
    try {
      loading.value = true
      if (id) {
        await EDIT_PAYMENT_METHOD({ id, data: form })
      } else {
        await ADD_PAYMENT_METHOD(form)
      }
      closePopUpPaymentMethod()
      getPaymentMethods()

      toast.addToast({
        text: `${t('paymentMethods.paymentMethodSaved')}`
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

  const deletePaymentMethod = async (id) => {
    try {
      await DELETE_PAYMENT_METHOD({ id })
      getPaymentMethods()
    } catch (error) {
      console.error(error)
    }
  }

  const selectedPaymentMethod = ref(null)
  const selectPaymentMethod = (paymentMethod) => {
    selectedPaymentMethod.value = paymentMethod
    openPopUpPaymentMethod()
  }

  const selectedDeleteId = ref(null)
  const selectDelete = (id) => {
    selectedDeleteId.value = id
    showConfirmPopUp.value = true
  }

  const showConfirmPopUp = ref(false)
  const confirmSuccess = () => {
    deletePaymentMethod(selectedDeleteId.value)
    showConfirmPopUp.value = false
  }
  const confirmCancel = () => {
    selectedDeleteId.value = null
    showConfirmPopUp.value = false
  }

  const showPopUpPaymentMethod = ref(false)
  const openPopUpPaymentMethod = () => {
    showPopUpPaymentMethod.value = true
  }
  const closePopUpPaymentMethod = () => {
    showPopUpPaymentMethod.value = false

    selectedPaymentMethod.value = null
  }

  const searchInterval = ref(null)
  const searchPaymentMethod = (text) => {
    params.search = text

    clearTimeout(searchInterval.value)
    searchInterval.value = setTimeout(() => {
      pushByParams()
    }, 500)
  }

  const pushByParams = () => {
    router.push({
      path: '/payment-methods',
      query: params
    })
  }

  const getDataByRouteFilter = () => {
    const query = route.query

    params.search = query.search

    getPaymentMethods()
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
              <m-button @click="openPopUpPaymentMethod" icon="addCircle" :title="t('add')" small />
            </div>
            <div class="table__right">
              <m-text-filed
                @updateValue="searchPaymentMethod"
                :value="params.search"
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
                  <th>{{ t('name') }}</th>
                  <th width="1">{{ t('action') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(paymentMethod, index) in paymentMethods">
                  <td @click="selectPaymentMethod(paymentMethod)" class="_cursor-pointer">{{ index + 1 }}</td>
                  <td @click="selectPaymentMethod(paymentMethod)" class="_cursor-pointer">
                    {{ paymentMethod.name[locale] }}
                  </td>
                  <td>
                    <m-button @click="selectDelete(paymentMethod.id)" icon="delete" styles="danger" outline only-icon />
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
    <pop-up-payment-method
      @save="savePaymentMethod"
      @close="closePopUpPaymentMethod"
      :item="selectedPaymentMethod"
      :loading="loading"
      v-if="showPopUpPaymentMethod"
    />
    <pop-up-confirm
      @no="confirmCancel"
      @yes="confirmSuccess"
      :title="t('paymentMethods.deletePaymentMethodsText')"
      v-if="showConfirmPopUp"
    />
  </teleport>
</template>

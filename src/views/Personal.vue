<script setup>
  import { ref, reactive, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useI18n } from 'vue-i18n'

  import MButton from '@/UI/MButton.vue'
  import MTextFiled from '@/UI/MTextFiled.vue'
  import MPagination from '@/UI/MPagination.vue'
  import MBadge from '@/UI/MBadge.vue'
  import PopUpPersonal from '@/components/popUps/PopUpPersonal.vue'
  import PopUpConfirm from '@/components/popUps/PopUpConfirm.vue'

  import { GET_PERSONALS, ADD_PERSONAL, DELETE_PERSONAL, EDIT_PERSONAL } from '@/api/personal.api'

  import { getDate } from '@/helpers/date'
  import { useToast } from '@/store/toast'

  const route = useRoute()
  const router = useRouter()
  const { t } = useI18n()

  const toast = useToast()

  const pageCount = ref(1)
  const params = reactive({
    page_size: 100,
    page: 1,
    search: ''
  })

  const personals = ref([])
  const getPersonal = async () => {
    try {
      const { data } = await GET_PERSONALS({
        params: {
          page_size: params.page_size,
          page: params.page,
          search: params.search
        }
      })

      personals.value = data?.managers || []
      pageCount.value = data?.last_page || 1
    } catch (error) {
      console.error(error)
    }
  }

  const loading = ref(false)
  const savePersonal = async ({ id, form }) => {
    try {
      loading.value = true
      if (id) {
        await EDIT_PERSONAL({ id, data: form })
      } else {
        await ADD_PERSONAL(form)
      }
      closePopUpPersonal()
      getPersonal()

      toast.addToast({
        text: t('personalSaved')
      })
    } catch (error) {
      console.error(error)
      toast.addToast({
        text: t('someProblemsWithServer'),
        status: 'error'
      })
    } finally {
      loading.value = false
    }
  }

  const deletePersonal = async (id) => {
    try {
      await DELETE_PERSONAL({ id })

      getPersonal()
    } catch (error) {
      console.error(error)
    }
  }

  const selectedPersonal = ref(null)
  const selectPersonal = (brand) => {
    selectedPersonal.value = brand
    openPopUpPersonal()
  }

  const selectedDeleteId = ref(null)
  const selectDelete = (id) => {
    selectedDeleteId.value = id
    showConfirmPopUp.value = true
  }

  const showConfirmPopUp = ref(false)
  const confirmSuccess = () => {
    deletePersonal(selectedDeleteId.value)
    showConfirmPopUp.value = false
  }
  const confirmCancel = () => {
    selectedDeleteId.value = null
    showConfirmPopUp.value = false
  }

  const showPopUpPersonal = ref(false)
  const openPopUpPersonal = () => {
    showPopUpPersonal.value = true
  }
  const closePopUpPersonal = () => {
    showPopUpPersonal.value = false
    selectedPersonal.value = null
  }

  const searchInterval = ref(null)
  const searchPersonal = (text) => {
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
      path: '/personal',
      query: params
    })
  }

  const getDataByRouteFilter = () => {
    const query = route.query

    params.page_size = Number(query.page_size) || 100
    params.page = Number(query.page) || 1
    params.search = query.search

    getPersonal()
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
              <m-button @click="openPopUpPersonal" icon="addCircle" :title="t('add')" small />
            </div>
            <div class="table__right">
              <m-text-filed
                @updateValue="searchPersonal"
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
                  <th>{{ t('name') }}</th>
                  <th>{{ t('email') }}</th>
                  <th>{{ t('phoneNumber') }}</th>
                  <th>{{ t('access') }}</th>
                  <th width="1">{{ t('status') }}</th>
                  <th width="1">{{ t('action') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(personal, index) in personals" :key="personal.id">
                  <td @click="selectPersonal(personal)" class="_cursor-pointer">
                    {{ (params.page - 1) * params.page_size + index + 1 }}
                  </td>
                  <td @click="selectPersonal(personal)" class="_cursor-pointer">{{ personal.name }}</td>
                  <td @click="selectPersonal(personal)" class="_cursor-pointer">{{ personal.email }}</td>
                  <td @click="selectPersonal(personal)" class="_cursor-pointer">{{ personal.number }}</td>
                  <td @click="selectPersonal(personal)" class="_cursor-pointer">{{ getDate(personal.last_login) }}</td>
                  <td @click="selectPersonal(personal)" class="_cursor-pointer">
                    <m-badge
                      :title="!!personal.status ? t('open') : t('close')"
                      :styles="!!personal.status ? 'success' : 'danger'"
                      outline
                    />
                  </td>
                  <td>
                    <m-button @click="selectDelete(personal.id)" icon="delete" styles="danger" outline only-icon />
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
    <pop-up-personal
      @save="savePersonal"
      @close="closePopUpPersonal"
      :item="selectedPersonal"
      :loading="loading"
      v-if="showPopUpPersonal"
    />
    <pop-up-confirm
      @no="confirmCancel"
      @yes="confirmSuccess"
      :title="t('deletePersonalText')"
      v-if="showConfirmPopUp"
    />
  </teleport>
</template>

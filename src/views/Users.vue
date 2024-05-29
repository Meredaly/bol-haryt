<script setup>
  import { ref, reactive, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useI18n } from 'vue-i18n'

  import MButton from '@/UI/MButton.vue'
  import MTextFiled from '@/UI/MTextFiled.vue'
  import MPagination from '@/UI/MPagination.vue'
  import PopUpUser from '@/components/popUps/PopUpUser.vue'
  import PopUpConfirm from '@/components/popUps/PopUpConfirm.vue'

  import { GET_USERS, ADD_USER, EDIT_USER, DELETE_USER } from '@/api/users.api'

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

  const users = ref([])
  const getUsers = async () => {
    try {
      const { data, last_page } = await GET_USERS({
        params: {
          page_size: params.page_size,
          page: params.page,
          search: params.search
        }
      })

      users.value = data || []

      pageCount.value = last_page
    } catch (error) {
      console.error(error)
    }
  }

  const loading = ref(false)
  const saveUser = async ({ id, form }) => {
    try {
      loading.value = true
      if (id) {
        await EDIT_USER({ id, data: form })
      } else {
        await ADD_USER(form)
      }
      closePopUpUser()
      getUsers()

      toast.addToast({
        text: `${t('users.userSaved')}`
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
      await DELETE_USER({ id })

      getUsers()
    } catch (error) {
      console.error(error)
    }
  }

  const selectedUser = ref(null)
  const selectUser = (brand) => {
    selectedUser.value = brand
    openPopUpUser()
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

  const showPopUpUser = ref(false)
  const openPopUpUser = () => {
    showPopUpUser.value = true
  }
  const closePopUpUser = () => {
    showPopUpUser.value = false

    selectedUser.value = null
  }

  const searchInterval = ref(null)
  const searchUser = (text) => {
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
      path: '/users',
      query: params
    })
  }

  const getDataByRouteFilter = () => {
    const query = route.query

    params.page_size = Number(query.page_size) || 100
    params.page = Number(query.page) || 1
    params.search = query.search

    getUsers()
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
              <m-button @click="openPopUpUser" icon="addCircle" :title="t('add')" small />
            </div>
            <div class="table__right">
              <m-text-filed
                @updateValue="searchUser"
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
                  <th>{{ t('phoneNumber') }}</th>
                  <th>{{ t('users.address') }}</th>
                  <th width="1">{{ t('action') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(brand, index) in users">
                  <td @click="selectUser(brand)" class="_cursor-pointer">
                    {{ (params.page - 1) * params.page_size + index + 1 }}
                  </td>
                  <td @click="selectUser(brand)" class="_cursor-pointer">{{ brand.name }}</td>
                  <td @click="selectUser(brand)" class="_cursor-pointer">{{ brand.number }}</td>
                  <td @click="selectUser(brand)" class="_cursor-pointer">{{ brand.address }}</td>
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
    <pop-up-user
      @save="saveUser"
      @close="closePopUpUser"
      :item="selectedUser"
      :loading="loading"
      v-if="showPopUpUser"
    />
    <pop-up-confirm
      @no="confirmCancel"
      @yes="confirmSuccess"
      :title="t('users.deleteUsersText')"
      v-if="showConfirmPopUp"
    />
  </teleport>
</template>

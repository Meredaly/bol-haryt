<script setup>
  import { ref, reactive, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useI18n } from 'vue-i18n'

  import MPagination from '@/UI/MPagination.vue'

  import { getDate } from '@/helpers/date'

  import { GET_ROOMS } from '@/api/chat.api'

  const route = useRoute()
  const router = useRouter()
  const { t } = useI18n()

  const pageCount = ref(1)
  const params = reactive({
    page_size: 100,
    page: 1
  })

  const chats = ref([])
  const getChats = async () => {
    try {
      const { data, last_page } = await GET_ROOMS({
        params: {
          page_size: params.page_size,
          page: params.page,
          filter: 'manager'
        }
      })

      chats.value = [...chats.value, ...data]
      pageCount.value = last_page
    } catch (error) {
      console.error(error)
    }
  }

  const updatePage = (page) => {
    params.page = page
    chats.value = []

    pushByParams()
  }

  const openChat = (chat) => {
    let params = '?'
    if (chat.client) {
      params += `user_name=${chat.client.name}&`
    }
    router.push(`/chat/${chat.id}${params}`)
  }

  const pushByParams = () => {
    router.push({
      path: '/admin-chats',
      query: params
    })
  }

  const getDataByRouteFilter = () => {
    const query = route.query

    params.page_size = Number(query.page_size) || 100
    params.page = Number(query.page) || 1

    getChats()
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
  <div class="chats">
    <div class="chats__wrapper">
      <div class="chats__body _box">
        <div class="table">
          <div class="table__body _no-footer">
            <table>
              <thead>
                <tr>
                  <th width="1">№</th>
                  <th>{{ t('userName') }}</th>
                  <th>{{ t('lastMessage') }}</th>
                  <th>{{ t('unreaded') }}</th>
                  <th>{{ t('date') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(chat, index) in chats" @click="openChat(chat)" class="_cursor-pointer">
                  <td>{{ (params.page - 1) * params.page_size + index + 1 }}</td>
                  <td>{{ chat.client.name }}</td>
                  <td>{{ chat.last_message.message }}</td>
                  <td>{{ chat.unread }}</td>
                  <td>{{ getDate(chat.created_at) }}</td>
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
  .chats {
    height: 100%;
    // .chats__wrapper
    &__wrapper {
      height: 100%;
    }
    // .chats__body
    &__body {
      overflow: auto;
      height: calc(100%);
      padding: 0;
    }
  }
</style>

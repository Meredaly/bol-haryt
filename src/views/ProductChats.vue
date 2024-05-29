<script setup>
  import { ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useI18n } from 'vue-i18n'

  import MButton from '@/UI/MButton.vue'
  import MPagination from '@/UI/MPagination.vue'

  import { getDate } from '@/helpers/date'

  import { GET_ROOMS } from '@/api/chat.api'

  const router = useRouter()
  const route = useRoute()
  const { t } = useI18n()

  const limit = ref(100)
  const page = ref(1)
  const pages = ref(1)

  const chats = ref([])
  const getChats = async () => {
    try {
      const { data, last_page } = await GET_ROOMS({
        params: {
          page_size: limit.value,
          page: page.value,
          product: route.params.id
        }
      })

      chats.value = [...chats.value, ...data]
      pages.value = last_page
    } catch (error) {
      console.error(error)
    }
  }

  getChats()

  const updatePage = (p) => {
    page.value = p
    chats.value = []
    getChats()
  }

  const openChat = (id) => {
    router.push(`/chat/${id}`)
  }

  const back = () => {
    router.back(-1)
  }
</script>

<template>
  <div class="chats">
    <div class="chats__wrapper">
      <div class="chats__head _box">
        <m-button @click="back" :title="t('back')" icon="chevronLeft" styles="secondary" outline />
      </div>
      <div class="chats__body _box">
        <div class="table">
          <div class="table__body">
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
                <tr v-for="(chat, index) in chats" class="_cursor-pointer" @click="openChat(chat.id)">
                  <td>{{ (page - 1) * limit + index + 1 }}</td>
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
              <m-pagination @click-page="updatePage" v-model="page" :page-count="pages" />
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
    // .chats__head
    &__head {
      display: flex;
    }
    // .chats__body
    &__body {
      overflow: auto;
      height: calc(100%);
      padding: 0;
    }
  }
</style>

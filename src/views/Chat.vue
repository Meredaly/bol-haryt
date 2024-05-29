<script setup>
  import { ref, onMounted, onUnmounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useI18n } from 'vue-i18n'

  import MIcons from '@/UI/MIcons.vue'
  import MButton from '@/UI/MButton.vue'
  import MImage from '@/UI/MImage.vue'

  import { getDate } from '@/helpers/date'

  import { GET_ROOM_MESSAGES, SEND_MESSAGE } from '@/api/chat.api'

  const route = useRoute()
  const router = useRouter()
  const { t } = useI18n()

  const limit = ref(20)
  const page = ref(1)
  const pages = ref(1)

  const messages = ref([])

  const loading = ref(false)

  const username = ref(route.query.user_name || '')
  const productData = ref(null)
  const getRoomMessages = async () => {
    try {
      loading.value = true
      let { data, last_page, product } = await GET_ROOM_MESSAGES({
        params: {
          id: route.params.id,
          page_size: limit.value,
          page: page.value
        }
      })
      productData.value = product
      data = data.reverse().map((message) => {
        return {
          id: message.id,
          text: message.message,
          date: getDate(message.created_at),
          position: message.client ? 'LEFT' : 'RIGHT'
        }
      })

      if (page.value === 1) {
        scrollToEnd()
      } else {
        scrollToId(data[data.length - 1].id)
      }
      messages.value = [...data, ...messages.value]
      pages.value = last_page
    } catch (error) {
      console.error(error)
    } finally {
      loading.value = false
    }
  }
  getRoomMessages()

  const newMessagesCount = ref(0)
  const updateCurrentMessages = async (newMessages = [], page = 1) => {
    try {
      let { data, last_page } = await GET_ROOM_MESSAGES({
        params: {
          id: route.params.id,
          page_size: 20,
          page: page
        }
      })
      newMessages = [...data.reverse(), ...newMessages]
      const lastMessage = messages.value[messages.value.length - 1]

      const toLastIndex = newMessages.findIndex((message) => {
        return lastMessage.id === message.id
      })
      if (toLastIndex >= 0) {
        for (let index = toLastIndex + 1; index < newMessages.length; index++) {
          messages.value.push({
            id: newMessages[index].id,
            text: newMessages[index].message,
            date: getDate(newMessages[index].created_at),
            position: newMessages[index].client ? 'LEFT' : 'RIGHT'
          })
          newMessagesCount.value += 1
        }
        return
      }
      if (last_page > page) updateCurrentMessages(newMessages, page + 1)
    } catch (error) {
      console.log(error)
    }
  }

  const updateRoomMessages = async () => {
    try {
      let { data } = await GET_ROOM_MESSAGES({
        params: {
          id: route.params.id,
          page_size: 1,
          page: 1
        }
      })
      if (!data.length) return
      if (data[0].id !== messages.value[messages.value.length - 1].id) {
        updateCurrentMessages()
      }
    } catch (error) {
      console.error(error)
    }
  }
  const updateMessageInterval = ref(null)
  updateMessageInterval.value = setInterval(() => {
    updateRoomMessages()
  }, 3000)

  onUnmounted(() => {
    clearInterval(updateMessageInterval.value)
  })

  const message = ref('')
  const sendMessage = async () => {
    try {
      const { data } = await SEND_MESSAGE({
        data: { message: message.value, room: route.params.id }
      })
      message.value = ''
      messages.value.push({
        id: data.last_message.id,
        text: data.last_message.message,
        date: getDate(data.created_at),
        position: 'RIGHT'
      })
      scrollToEnd()
    } catch (error) {
      console.error(error)
    }
  }

  const back = () => {
    router.go(-1)
  }

  const scrollToBot = () => {
    chatList.value.scrollTo({
      left: 0,
      top: chatList.value.scrollHeight,
      behavior: 'smooth'
    })
    newMessagesCount.value = 0
  }

  const chatList = ref(null)
  onMounted(() => {
    scrollToEnd()
    chatList.value.addEventListener(
      'scroll',
      () => {
        if (chatList.value.scrollTop < 100 && page.value < pages.value && !loading.value) {
          page.value = page.value + 1
          getRoomMessages()
        }
        if (chatList.value.scrollHeight - (chatList.value.scrollTop + chatList.value.clientHeight) < 20) {
          newMessagesCount.value = 0
        }
      },
      { passive: true }
    )
  })

  const scrollToId = (id) => {
    setTimeout(() => {
      const height = document.getElementById(id.toString()).offsetTop
      chatList.value.scrollTo(0, height)
    }, 0)
  }

  const scrollToEnd = () => {
    if (chatList.value) {
      setTimeout(() => {
        const height = chatList.value.scrollHeight
        chatList.value.scrollTo(0, height)
      }, 0)
    }
  }
</script>

<template>
  <div class="chat">
    <div class="chat__header">
      <div class="chat__back">
        <m-button @click="back" :title="t('back')" icon="chevronLeft" styles="secondary" outline />
      </div>
      <div class="chat__info">
        <div class="chat__user">{{ username }}</div>
      </div>
      <div v-if="productData" class="chat__product">
        <p>{{ productData.name }}</p>
        <m-image :image="productData.image" width="40px" height="40px" />
      </div>
    </div>
    <div class="chat__body">
      <div class="chat__body-box">
        <button @click="scrollToBot" v-if="newMessagesCount" class="chat__new-messages">
          <m-icons name="chevronBottom" />
          <div>{{ newMessagesCount }}</div>
        </button>
        <div class="chat__chat-list" ref="chatList">
          <div
            v-for="message in messages"
            :key="message.id"
            :id="message.id"
            :class="[
              'chat__chat-item',
              {
                'chat__chat-item_left': message.position === 'LEFT',
                'chat__chat-item_right': message.position === 'RIGHT'
              }
            ]"
          >
            <div class="chat__message">
              <div class="chat__message-text">
                {{ message.text }}
                <span class="chat__message-dummy-date">{{ message.date }}</span>
              </div>
              <span class="chat__message-date">{{ message.date }}</span>
            </div>
          </div>
        </div>
        <div class="chat__chat-text-message">
          <textarea @keydown.prevent.enter="sendMessage" v-model="message" :placeholder="t('message')"></textarea>
          <button @click="sendMessage">
            <m-icons name="send" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .chat {
    height: 100%;
    // .chat__header
    &__header {
      display: flex;
      align-items: center;
      padding: 20px;
      background-color: var(--white);
      border-radius: var(--box-radius);
      gap: 20px;
    }
    // .chat__back
    &__back {
    }
    // .chat__info
    &__info {
      flex: 1 1;
    }
    // .chat__user
    &__user {
      font-size: 18px;
      color: var(--gray-900);
      font-weight: 500;
    }
    // .chat__product
    &__product {
      font-size: 14px;
      color: var(--gray-600);
      display: flex;
      align-items: center;
      gap: 10px;
      p {
        max-width: 300px;
      }
    }
    // .chat__delete
    &__delete {
    }
    // .chat__body
    &__body {
      height: calc(100% - 84px);
      max-width: 900px;
      margin: 0 auto;
    }
    // .chat__body-box
    &__body-box {
      height: 100%;
      width: 100%;
      display: flex;
      flex-direction: column;
      position: relative;
    }
    // .chat__new-messages
    &__new-messages {
      position: absolute;
      z-index: 3;
      width: 50px;
      height: 50px;
      background-color: var(--white);
      box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      bottom: 70px;
      right: 30px;
      div {
        position: absolute;
        background-color: var(--primary-600);
        color: var(--white);
        border-radius: 20px;
        line-height: 20px;
        min-width: 20px;
        bottom: 0;
        right: 0;
        z-index: 1;
      }
    }
    // .chat__chat-list
    &__chat-list {
      height: 0;
      flex: 1 1;
      overflow-y: auto;
      margin-bottom: 10px;
    }
    // .chat__chat-item
    &__chat-item {
      max-width: 80%;
      margin-top: 10px;
      // .chat__chat-item_left
      &_left {
      }

      // .chat__chat-item_right
      &_right {
        margin-left: auto;
        .chat__message {
          background-color: var(--primary-600);
          border-radius: 17px 6px 6px 17px;
          margin-right: 0;
          margin-left: auto;
        }
        .chat__message-text {
          color: var(--white);
        }
        .chat__message-date {
          color: var(--gray-300);
        }
      }
    }
    .chat__chat-item_left + .chat__chat-item_left {
      margin-top: 4px;
    }
    .chat__chat-item_right + .chat__chat-item_right {
      margin-top: 4px;
    }

    // .chat__message
    &__message {
      background-color: #ffffff;
      padding: 8px 12px;
      border-radius: 6px 17px 17px 6px;
      -ms-box-sizing: border-box;
      -moz-box-sizing: border-box;
      -webkit-box-sizing: border-box;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      max-width: 100%;
      padding: 16px 20px;
      position: relative;
      text-align: left;
      -moz-user-select: none;
      -webkit-user-select: none;
      -o-user-select: none;
      -ms-user-select: none;
      user-select: none;
      vertical-align: top;
      white-space: normal;
      width: fit-content;
      word-break: break-word;
      margin-right: auto;
    }
    // .chat__message-text
    &__message-text {
      font-size: 16px;
      line-height: 20px;
      color: #282828;
    }
    // .chat__message-dummy-date
    &__message-dummy-date {
      -moz-box-orient: vertical;
      display: -moz-inline-box;
      display: inline-block;
      font-size: 14px;
      padding-left: 10px;
      vertical-align: middle;
      visibility: hidden;
      white-space: nowrap;
    }
    // .chat__message-date
    &__message-date {
      bottom: 10px;
      font-size: 14px;
      left: auto;
      line-height: 14px;
      position: absolute;
      right: 10px;
      top: auto;
      transition: opacity 0.3s;
      -moz-transition: opacity 0.3s;
      -o-transition: opacity 0.3s;
      -webkit-transition: opacity 0.3s;
      -moz-user-select: none;
      -webkit-user-select: none;
      -o-user-select: none;
      -ms-user-select: none;
      user-select: none;
      white-space: nowrap;
      color: #a0a0a0;
    }
    // .chat__chat-text-message
    &__chat-text-message {
      display: flex;
      border-radius: 50px;
      overflow: hidden;
      background-color: #ffffff;
      textarea {
        width: 100%;
        resize: none;
        font-size: 15px;
        line-height: 19px;
        padding: 20px 30px;
        height: 59px;
        min-height: 39px;
        max-height: 80px;
        &::-webkit-scrollbar {
          width: 3px;
        }
        &::-webkit-scrollbar-track {
          background: transparent;
        }
        &::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 2px;
        }
        &::-webkit-scrollbar-thumb:hover {
          background: var(--primary-600);
        }
      }
      button {
        padding: 10px 20px;
        color: var(--primary-600);
        display: block;
        background-color: transparent;
        &:disabled {
          opacity: 0.7;
        }
      }
    }
  }
</style>

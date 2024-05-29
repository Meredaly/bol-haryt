<script setup>
  import { ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useI18n } from 'vue-i18n'

  import MIcons from '@/UI/MIcons.vue'
  import MButton from '@/UI/MButton.vue'
  import MCheckbox from '@/UI/MCheckbox.vue'
  import MTextarea from '@/UI/MTextarea.vue'
  import MImage from '@/UI/MImage.vue'
  import PopUpConfirm from '@/components/popUps/PopUpConfirm.vue'

  import { GET_COMMENT, EDIT_COMMENT, ADD_REPLY_COMMENT, EDIT_REPLY_COMMENT, DELETE_COMMENT } from '@/api/comments.api'

  import { useAuth } from '@/store/auth'
  import { getDate } from '@/helpers/date'

  const route = useRoute()
  const router = useRouter()
  const { t } = useI18n()

  const auth = useAuth()
  const isSeller = ref(auth.role === 'SELLER')

  const back = () => {
    router.go(-1)
  }

  const comment = ref({
    id: null,
    product: null,
    ball: 0,
    message: '',
    client: null,
    created_at: '',
    updated_at: '',
    status: 0,
    reply: null
  })

  const getComment = async () => {
    try {
      const { data } = await GET_COMMENT({ id: route.params.id })
      comment.value = data
    } catch (error) {
      console.error(error)
    }
  }
  getComment()

  const updateComment = async () => {
    try {
      await EDIT_COMMENT({
        id: comment.value.id,
        data: {
          message: comment.value.message,
          ball: comment.value.ball,
          status: comment.value.status
        }
      })
    } catch (error) {
      console.error(error)
    }
  }

  const selectedDeleteCommentId = ref(null)
  const selectDeleteComment = (id) => {
    selectedDeleteCommentId.value = id
    showConfirmCommentPopUp.value = true
  }

  const showConfirmCommentPopUp = ref(false)
  const confirmSuccessComment = () => {
    deleteComment(selectedDeleteCommentId.value)
    showConfirmCommentPopUp.value = false
  }
  const confirmCancelOrder = () => {
    selectedDeleteCommentId.value = null
    showConfirmCommentPopUp.value = false
  }

  const deleteComment = async (id) => {
    try {
      await DELETE_COMMENT({ id: id })
      back()
    } catch (error) {
      console.error(error)
    }
  }

  const replyText = ref('')
  const replyComment = async () => {
    try {
      const { data } = await ADD_REPLY_COMMENT({
        comment: comment.value.id,
        message: replyText.value
      })
      comment.value = data
      replyText.value = ''
    } catch (error) {
      console.error(error)
    }
  }

  const updateReplyComment = async () => {
    try {
      const { data } = await EDIT_REPLY_COMMENT({
        id: comment.value.id,
        data: {
          reply: comment.value.reply.id,
          message: replyText.value
        }
      })
      comment.value = data
      closeEditReply()
    } catch (error) {
      console.error(error)
    }
  }

  const updateStatus = (status) => {
    comment.value.status = status ? 1 : 0
    updateComment()
  }
  const showEditReply = ref(false)
  const openEditReply = () => {
    showEditReply.value = true
    replyText.value = comment.value.reply.message
  }
  const closeEditReply = () => {
    showEditReply.value = false
    replyText.value = ''
  }
</script>

<template>
  <div class="product-comment _box">
    <div class="product-comment__wrapper">
      <div class="product-comment__head">
        <div class="product-comment__head-left">
          <m-button @click="back" :title="t('back')" icon="chevronLeft" styles="secondary" outline />
          <div v-if="comment.product" class="product-comment__product">
            <m-image :image="comment.product?.image" width="40px" height="40px" />
            <p>{{ comment.product?.name }}</p>
          </div>
        </div>
        <m-button
          v-if="!isSeller"
          @click="selectDeleteComment(comment.id)"
          :title="t('delete')"
          icon="delete"
          styles="danger"
          outline
          only-icon
        />
      </div>
      <div class="product-comment__comments">
        <div class="product-comment__comment">
          <div class="product-comment__content">
            <div class="product-comment__user">
              <p>{{ comment.client?.name }}</p>
              <span>{{ comment.client?.number }}</span>
            </div>
            <div v-if="comment.message" class="product-comment__text">{{ comment.message }}</div>
            <div v-if="comment.created_at" class="product-comment__date">{{ getDate(comment.created_at) }}</div>
            <div class="product-comment__stars">
              <m-icons v-for="index in comment.ball" name="starFilled" class="_active" />
              <m-icons v-for="index in 5 - comment.ball" name="starRegular" />
            </div>
            <div class="product-comment__status">
              <m-checkbox
                @update-status="updateStatus"
                :value="!!comment.status"
                :title="t('status')"
                :disabled="isSeller"
              />
            </div>
          </div>
          <m-button v-if="false" icon="delete" styles="danger" outline only-icon />
        </div>
        <div v-if="comment.reply && !showEditReply" class="product-comment__comment _answer">
          <div class="product-comment__content">
            <div class="product-comment__text">{{ comment.reply.message }}</div>
            <div class="product-comment__date">{{ getDate(comment.reply.created_at) }}</div>
          </div>
          <m-button @click="openEditReply" icon="edit" styles="success" outline only-icon />
        </div>
      </div>
      <div v-if="showEditReply">
        <m-textarea v-model="replyText" background />
        <div class="flex gap-10 flex-x-end mt-10">
          <m-button @click="closeEditReply" :title="t('cancel')" styles="secondary" />
          <m-button @click="updateReplyComment" :title="t('save')" />
        </div>
      </div>
      <div v-if="comment.id && !comment.reply">
        <m-textarea v-model="replyText" background />
        <div class="flex gap-10 flex-x-end mt-10">
          <m-button @click="replyComment" :title="t('save')" />
        </div>
      </div>
    </div>
  </div>
  <div class="rating__total-stars"></div>

  <teleport to="#pop-up">
    <pop-up-confirm
      @yes="confirmSuccessComment"
      @no="confirmCancelOrder"
      v-if="showConfirmCommentPopUp"
      :title="t('deleteCommentText')"
    />
  </teleport>
</template>

<style lang="scss" scoped>
  .product-comment {
    height: 100%;
    overflow: auto;
    // .product-comment__wrapper
    &__wrapper {
      height: 100%;
    }
    // .product-comment__head
    &__head {
      display: flex;
      justify-content: space-between;
    }
    // .product-comment__head-left
    &__head-left {
      display: flex;
      gap: 10px;
      align-items: center;
    }
    // .product-comment__product
    &__product {
      display: flex;
      align-items: center;
      gap: 10px;
      p {
        font-weight: 500;
        max-width: 300px;
      }
    }
    // .product-comment__comments
    &__comments {
      margin: 20px 0;
    }
    // .product-comment__comment
    &__comment {
      max-width: 60%;
      display: flex;
      gap: 10px;
      align-items: flex-end;
      margin-bottom: 10px;
      &._answer {
        margin-left: auto;
        flex-direction: row-reverse;
        .product-comment__content {
          border-radius: 12px 0 12px 12px;
        }
      }
    }
    // .product-comment__user
    &__user {
      border-bottom: 1px solid var(--gray-300);
      padding-bottom: 4px;
      margin-bottom: 8px;
      color: var(--gray-800);
      p {
        font-size: 16px;
        font-weight: 700;
        line-height: 1.5;
      }
      span {
        font-size: 14px;
        line-height: 1.5;
        font-weight: 400;
        margin-top: 4px;
      }
    }
    // .product-comment__content
    &__content {
      background-color: var(--gray-100);
      border-radius: 0 12px 12px 12px;
      padding: 20px;
      border: 1px solid var(--gray-300);
      flex: 1 1;
    }
    // .product-comment__text
    &__text {
      font-size: 16px;
      color: var(--gray-800);
      font-weight: 500;
    }
    // .product-comment__date
    &__date {
      font-size: 13px;
      margin-top: 8px;
      display: block;
      color: var(--gray-600);
    }

    // .product-comment__stars
    &__stars {
      color: var(--warning-600);
      display: flex;
      gap: 2px;
      margin-top: 10px;
    }
    // .product-comment__status
    &__status {
      margin-top: 4px;
    }
  }
</style>

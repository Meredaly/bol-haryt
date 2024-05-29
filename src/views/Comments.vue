<script setup>
  import { ref, reactive, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useI18n } from 'vue-i18n'

  import MIcons from '@/UI/MIcons.vue'
  import MImage from '@/UI/MImage.vue'
  import MButton from '@/UI/MButton.vue'
  import MBadge from '@/UI/MBadge.vue'
  import MPagination from '@/UI/MPagination.vue'
  import PopUpConfirm from '@/components/popUps/PopUpConfirm.vue'

  import { GET_COMMENTS, DELETE_COMMENT } from '@/api/comments.api'

  import { getDate } from '@/helpers/date'
  import { useAuth } from '@/store/auth'

  const route = useRoute()
  const router = useRouter()
  const { t } = useI18n()

  const auth = useAuth()
  const isSeller = ref(auth.role === 'SELLER')

  const pageCount = ref(1)
  const params = reactive({
    page_size: 100,
    page: 1
  })

  const comments = ref([])

  const getComments = async () => {
    try {
      const { data } = await GET_COMMENTS({
        params: {
          page_size: params.page_size,
          page: params.page
        }
      })

      comments.value = data?.comments || []

      pageCount.value = data?.last_page || 1
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

      getComments()
    } catch (error) {
      console.error(error)
    }
  }

  const updatePage = (page) => {
    params.page = page
    comments.value = []

    pushByParams()
  }

  const openComment = (id) => {
    router.push(`/product-comment/${id}`)
  }

  const pushByParams = () => {
    router.push({
      path: '/comments',
      query: params
    })
  }

  const getDataByRouteFilter = () => {
    const query = route.query

    params.page_size = Number(query.page_size) || 100
    params.page = Number(query.page) || 1

    getComments()
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
  <div class="comments">
    <div class="comments__wrapper">
      <div class="comments__body _box">
        <div class="table">
          <div class="table__body _no-footer">
            <table>
              <thead>
                <tr>
                  <th width="1">№</th>
                  <th width="400">{{ t('product') }}</th>
                  <th width="300">{{ t('text') }}</th>
                  <th>{{ t('user') }}</th>
                  <th>{{ t('stars') }}</th>
                  <th>{{ t('status') }}</th>
                  <th>{{ t('date') }}</th>
                  <th v-if="!isSeller" width="1">{{ t('action') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(comment, index) in comments" class="_cursor-pointer">
                  <td @click="openComment(comment.id)">{{ (params.page - 1) * params.page_size + index + 1 }}</td>
                  <td @click="openComment(comment.id)">
                    <div v-if="comment.product" class="flex gap-10">
                      <m-image :image="comment.product?.image" width="40px" height="40px" />
                      <p>{{ comment.product?.name }}</p>
                    </div>
                  </td>
                  <td @click="openComment(comment.id)">{{ comment.message }}</td>
                  <td @click="openComment(index)" class="_cursor-pointer">
                    <p>{{ comment.client?.name }}</p>
                    <span>{{ comment.client?.number }}</span>
                  </td>
                  <td @click="openComment(comment.id)">
                    <div class="rating__starts">
                      <m-icons v-for="i in comment.ball" name="starFilled" class="_active" />
                      <m-icons v-for="i in 5 - comment.ball" name="starRegular" />
                    </div>
                  </td>
                  <td @click="openComment(comment.id)">
                    <m-badge
                      :title="!!comment.status ? t('open') : t('close')"
                      :styles="!!comment.status ? 'success' : 'danger'"
                      outline
                    />
                  </td>
                  <td @click="openComment(comment.id)">{{ getDate(comment.created_at) }}</td>
                  <td v-if="!isSeller">
                    <m-button
                      @click="selectDeleteComment(comment.id)"
                      icon="delete"
                      styles="danger"
                      outline
                      only-icon
                    />
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
    <pop-up-confirm
      @yes="confirmSuccessComment"
      @no="confirmCancelOrder"
      v-if="showConfirmCommentPopUp"
      :title="t('deleteCommentText')"
    />
  </teleport>
</template>

<style lang="scss" scoped>
  .comments {
    height: 100%;
    // .comments__wrapper
    &__wrapper {
      height: 100%;
    }
    // .comments__body
    &__body {
      overflow: auto;
      height: calc(100%);
      padding: 0;
    }
  }

  .rating {
    // .rating__wrapper
    &__wrapper {
      display: flex;
      align-items: center;
    }
    // .rating__main
    &__main {
      width: 200px;
    }
    // .rating__total-stars
    &__total-stars {
      color: var(--warning-600);
      display: flex;
    }
    // .rating__total-count
    &__total-count {
      margin-top: 10px;
      font-size: 16px;
      color: var(--gray-600);
      span {
        font-weight: 700;
      }
    }
    // .rating__list
    &__list {
    }
    // .rating__item
    &__item {
      display: flex;
      align-items: center;
      gap: 10px;
      &:not(:first-child) {
        margin-top: 2px;
      }
    }
    // .rating__starts
    &__starts {
      display: flex;
      gap: 2px;
      color: var(--gray-600);
      ._active {
        color: var(--warning-600);
      }
      &:deep() {
        svg {
          width: 20px;
          height: 20px;
        }
      }
    }
    // .rating__percent
    &__percent {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    // .rating__percent-line
    &__percent-line {
      width: 200px;
      background-color: var(--gray-200);
      border-radius: 2px;
      height: 4px;
      position: relative;
      &::before {
        content: '';
        display: block;
        height: 100%;
        border-radius: 2px;
        background-color: var(--primary-600);
        width: var(--progress);
      }
    }
    // .rating__percent-count
    &__percent-count {
      color: var(--gray-600);
    }
  }
</style>

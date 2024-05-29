<script setup>
  import { ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useI18n } from 'vue-i18n'

  import MIcons from '@/UI/MIcons.vue'
  import MButton from '@/UI/MButton.vue'
  import MBadge from '@/UI/MBadge.vue'
  import MPagination from '@/UI/MPagination.vue'

  import { GET_COMMENTS, DELETE_COMMENT } from '@/api/comments.api'

  import { useAuth } from '@/store/auth'
  import { getDate } from '@/helpers/date'

  const route = useRoute()
  const router = useRouter()
  const { t, locale } = useI18n()

  const auth = useAuth()
  const isSeller = ref(auth.role === 'SELLER')

  const back = () => {
    router.go(-1)
  }

  const page = ref(1)
  const pageCount = ref(1)
  const limit = ref(100)

  const comments = ref([])

  const ratingList = ref([
    { stars: 5, count: 0, percent: 0 },
    { stars: 4, count: 0, percent: 0 },
    { stars: 3, count: 0, percent: 0 },
    { stars: 2, count: 0, percent: 0 },
    { stars: 1, count: 0, percent: 0 }
  ])
  const commentsCount = ref(0)
  const starsAverage = ref(0)
  const productName = ref('')

  const getComments = async () => {
    try {
      const { data } = await GET_COMMENTS({
        params: {
          product: route.params.id,
          page_size: limit.value,
          page: page.value
        }
      })
      comments.value = data?.comments || []
      pageCount.value = data?.last_page || 1

      commentsCount.value = data.count

      productName.value = data.product_name

      let starsCount = 0
      for (let index = 0; index < 5; index++) {
        ratingList.value[index].count = data.stars[ratingList.value[index].stars]
        ratingList.value[index].percent = Math.round(
          (data.stars[ratingList.value[index].stars] / commentsCount.value) * 100
        )
        starsCount += data.stars[ratingList.value[index].stars] * ratingList.value[index].stars
      }
      starsAverage.value = Math.round((starsCount / commentsCount.value) * 10) / 10 || 0
    } catch (error) {
      console.error(error)
    }
  }
  getComments()

  const updatePage = (p) => {
    page.value = p
    comments.value = []
    getComments()
  }

  const deleteComment = async (index) => {
    try {
      await DELETE_COMMENT({ id: comments.value[index].id })
      getComments()
    } catch (error) {
      console.error(error)
    }
  }

  const openComment = (index) => {
    router.push(`/product-comment/${comments.value[index].id}`)
  }
</script>

<template>
  <div class="product-comments">
    <div class="product-comments__wrapper">
      <div class="product-comments__head _box">
        <div class="product-comments__head-product-info">
          <m-button @click="back" :title="t('back')" icon="chevronLeft" styles="secondary" outline />
          <h3 class="mt-20">{{ productName?.[locale] }}</h3>
        </div>
        <div class="product-comments__head-rating">
          <div class="rating">
            <div class="rating__wrapper">
              <div class="rating__main">
                <div class="rating__total-stars">
                  <m-icons :name="starsAverage >= 1 ? 'starFilled' : starsAverage > 0 ? 'starHalf' : 'starRegular'" />
                  <m-icons :name="starsAverage >= 2 ? 'starFilled' : starsAverage > 1 ? 'starHalf' : 'starRegular'" />
                  <m-icons :name="starsAverage >= 3 ? 'starFilled' : starsAverage > 2 ? 'starHalf' : 'starRegular'" />
                  <m-icons :name="starsAverage >= 4 ? 'starFilled' : starsAverage > 3 ? 'starHalf' : 'starRegular'" />
                  <m-icons :name="starsAverage === 5 ? 'starFilled' : starsAverage > 4 ? 'starHalf' : 'starRegular'" />
                </div>
                <div class="rating__total-count">
                  <span>{{ starsAverage }}</span> {{ t('from') }} 5
                </div>
              </div>
              <div class="rating__list">
                <div v-for="rating in ratingList" class="rating__item">
                  <div class="rating__starts">
                    <m-icons v-for="index in rating.stars" :key="index" name="starFilled" class="_active" />
                    <m-icons v-for="index in 5 - rating.stars" :key="index" name="starRegular" />
                  </div>
                  <div class="rating__percent">
                    <div class="rating__percent-line" :style="`--progress: ${rating.percent}%`"></div>
                    <div class="rating__percent-count">{{ rating.count }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="product-comments__body _box mt-20">
        <div class="table">
          <div class="table__body _no-footer">
            <table>
              <thead>
                <tr>
                  <th width="1">№</th>
                  <th>{{ t('text') }}</th>
                  <th>{{ t('user') }}</th>
                  <th>{{ t('stars') }}</th>
                  <th>{{ t('status') }}</th>
                  <th>{{ t('date') }}</th>
                  <th v-if="!isSeller" width="1">{{ t('action') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(comment, index) in comments">
                  <td @click="openComment(index)">{{ (page - 1) * limit + index + 1 }}</td>
                  <td @click="openComment(index)" class="_cursor-pointer">{{ comment.message }}</td>
                  <td @click="openComment(index)" class="_cursor-pointer">
                    <p>{{ comment.client?.name }}</p>
                    <span>{{ comment.client?.number }}</span>
                  </td>
                  <td @click="openComment(index)">
                    <div class="rating__starts">
                      <m-icons v-for="index in comment.ball" name="starFilled" class="_active" />
                      <m-icons v-for="index in 5 - comment.ball" name="starRegular" />
                    </div>
                  </td>
                  <td @click="openComment(index)">
                    <m-badge
                      :title="!!comment.status ? t('open') : t('close')"
                      :styles="!!comment.status ? 'success' : 'danger'"
                      outline
                    />
                  </td>
                  <td @click="openComment(index)">{{ getDate(comment.created_at) }}</td>
                  <td v-if="!isSeller">
                    <m-button @click="deleteComment(index)" icon="delete" styles="danger" outline only-icon />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="table__footer">
            <div class="table__footer-left"></div>
            <div class="table__footer-right">
              <m-pagination @click-page="updatePage" v-model="page" :page-count="pageCount" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .product-comments {
    height: 100%;
    // .product-comments__wrapper
    &__wrapper {
      height: 100%;
    }
    // .product-comments__head
    &__head {
      display: flex;
    }
    // .product-comments__head-product-info
    &__head-product-info {
      width: 50%;
    }
    // .product-comments__head-rating
    &__head-rating {
      width: 50%;
    }
    // .product-comments__body
    &__body {
      overflow: auto;
      height: calc(100% - 168px);
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

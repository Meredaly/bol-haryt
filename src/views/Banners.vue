<script setup>
  import { ref, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { Container, Draggable } from 'vue3-smooth-dnd'
  import { useI18n } from 'vue-i18n'

  import MButton from '@/UI/MButton.vue'
  import MImage from '@/UI/MImage.vue'
  import MBadge from '@/UI/MBadge.vue'
  import MTextFiled from '@/UI/MTextFiled.vue'
  import PopUpBanner from '@/components/popUps/PopUpBanner.vue'
  import PopUpConfirm from '@/components/popUps/PopUpConfirm.vue'

  import { GET_BANNERS, ADD_BANNER, EDIT_BANNER, DELETE_BANNER, EDIT_BANNER_POSITIONS } from '@/api/banner.api'

  import { applyDrag } from '@/helpers/dnd'
  import { useToast } from '@/store/toast'

  const route = useRoute()
  const router = useRouter()
  const { t } = useI18n()

  const toast = useToast()

  const search = ref('')

  const banners = ref([])
  const getBanners = async () => {
    try {
      const { data } = await GET_BANNERS({
        params: {
          search: search.value
        }
      })

      banners.value = data || []
    } catch (error) {
      console.error(error)
    }
  }

  const loading = ref(false)
  const saveBanner = async ({ id, form }) => {
    try {
      loading.value = true
      if (id) {
        await EDIT_BANNER({ id, data: form })
      } else {
        await ADD_BANNER(form)
      }
      closePopUpBanner()
      getBanners()

      toast.addToast({
        text: t('bannerSaved')
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

  const deleteBanner = async (id) => {
    try {
      await DELETE_BANNER({ id })

      getBanners()
    } catch (error) {
      console.error(error)
    }
  }

  const selectedBanner = ref(null)
  const selectBanner = (brand) => {
    selectedBanner.value = brand
    openPopUpBanner()
  }

  const selectedDeleteId = ref(null)
  const selectDelete = (id) => {
    selectedDeleteId.value = id
    showConfirmPopUp.value = true
  }

  const showConfirmPopUp = ref(false)
  const confirmSuccess = () => {
    deleteBanner(selectedDeleteId.value)
    showConfirmPopUp.value = false
  }
  const confirmCancel = () => {
    selectedDeleteId.value = null
    showConfirmPopUp.value = false
  }

  const showPopUpBanner = ref(false)
  const openPopUpBanner = () => {
    showPopUpBanner.value = true
  }
  const closePopUpBanner = () => {
    showPopUpBanner.value = false

    selectedBanner.value = null
  }

  const editBannerPositions = async (banners) => {
    try {
      const bannersPosition = banners.map((banner, index) => {
        return {
          id: banner.id,
          order: index + 1
        }
      })

      await EDIT_BANNER_POSITIONS({
        data: bannersPosition
      })

      getBanners()
    } catch (error) {
      console.error(error)
    }
  }

  const onDrop = (dropResult) => {
    banners.value = applyDrag(banners.value, dropResult)

    editBannerPositions(banners.value)
  }

  const searchInterval = ref(null)
  const searchBanner = (text) => {
    search.value = text

    clearTimeout(searchInterval.value)
    searchInterval.value = setTimeout(() => {
      pushByParams()
    }, 500)
  }

  const pushByParams = () => {
    router.push({
      path: '/banners',
      query: {
        search: search.value
      }
    })
  }

  const getDataByRouteFilter = () => {
    const query = route.query

    search.value = query.search

    getBanners()
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
              <m-button @click="openPopUpBanner" icon="addCircle" :title="t('add')" small />
            </div>
            <div class="table__right">
              <m-text-filed
                @updateValue="searchBanner"
                :value="search"
                background
                :placeholder="t('search')"
                width="260"
                prepend-icon="search"
              />
            </div>
          </div>
          <div class="table__body _no-footer _bc-gray-100">
            <div class="drag-table">
              <div class="drag-table__header">
                <div class="drag-table__row">
                  <div class="drag-table__row-wrapper">
                    <div class="drag-table__col drag-width"></div>
                    <div class="drag-table__col number-width">№</div>
                    <div class="drag-table__col image-width">{{ t('photo') }}</div>
                    <div class="drag-table__col">{{ t('name') }} (RU)</div>
                    <div class="drag-table__col">{{ t('name') }} (TM)</div>
                    <div class="drag-table__col status-width">{{ t('status') }}</div>
                    <div class="drag-table__col action-width">{{ t('action') }}</div>
                  </div>
                </div>
              </div>
              <Container
                @drop="onDrop"
                lock-axis="y"
                drag-handle-selector=".column-drag-handle"
                class="drag-table__body"
              >
                <Draggable v-for="(banner, index) in banners" :key="banner.id" class="drag-table__row">
                  <div class="drag-table__row-wrapper">
                    <div class="drag-table__col drag-width">
                      <m-button icon="reOrderDots" styles="light" only-icon class="column-drag-handle" />
                    </div>
                    <div class="drag-table__col number-width">{{ index + 1 }}</div>
                    <div @click="selectBanner(banner)" class="drag-table__col image-width _cursor-pointer">
                      <m-image :image="banner.image" width="80px" height="80px" />
                    </div>
                    <div @click="selectBanner(banner)" class="drag-table__col _cursor-pointer">
                      {{ banner.name_ru }}
                    </div>
                    <div @click="selectBanner(banner)" class="drag-table__col _cursor-pointer">
                      {{ banner.name_tm }}
                    </div>
                    <div @click="selectBanner(banner)" class="drag-table__col status-width _cursor-pointer">
                      <m-badge
                        :title="!!banner.status ? 'Открыть' : 'Закрыть'"
                        :styles="!!banner.status ? 'success' : 'danger'"
                        outline
                      />
                    </div>
                    <div class="drag-table__col action-width flex gap-10">
                      <m-button @click="selectDelete(banner.id)" icon="delete" styles="danger" outline only-icon />
                    </div>
                  </div>
                </Draggable>
              </Container>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <teleport to="#pop-up">
    <pop-up-banner @save="saveBanner" @close="closePopUpBanner" :item="selectedBanner" v-if="showPopUpBanner" />
    <pop-up-confirm @no="confirmCancel" @yes="confirmSuccess" :title="t('deleteBannerText')" v-if="showConfirmPopUp" />
  </teleport>
</template>

<script setup>
  import { ref, reactive, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useI18n } from 'vue-i18n'

  import MButton from '@/UI/MButton.vue'
  import MBadge from '@/UI/MBadge.vue'
  import MTextFiled from '@/UI/MTextFiled.vue'
  import MPagination from '@/UI/MPagination.vue'
  import PopUpTag from '@/components/popUps/PopUpTag.vue'
  import PopUpConfirm from '@/components/popUps/PopUpConfirm.vue'

  import { GET_TAGS, ADD_TAG, EDIT_TAG, DELETE_TAG } from '@/api/tag.api'

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

  const tags = ref([])
  const getTags = async () => {
    try {
      const { data, last_page } = await GET_TAGS({
        params: {
          page_size: params.page_size,
          page: params.page,
          search: params.search
        }
      })

      tags.value = data || []

      pageCount.value = last_page
    } catch (error) {
      console.error(error)
    }
  }

  const loading = ref(false)
  const saveTag = async ({ id, form }) => {
    try {
      loading.value = true
      if (id) {
        await EDIT_TAG({ id, data: form })
      } else {
        await ADD_TAG(form)
      }
      closePopUpTag()
      getTags()

      toast.addToast({
        text: `${t('tagLocales.tagSaved')}`
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

  const deleteTag = async (id) => {
    try {
      await DELETE_TAG({ id })
      getTags()
    } catch (error) {
      console.error(error)
    }
  }

  const selectedTag = ref(null)
  const selectTag = (brand) => {
    selectedTag.value = brand
    openPopUpTag()
  }

  const selectedDeleteId = ref(null)
  const selectDelete = (id) => {
    selectedDeleteId.value = id
    showConfirmPopUp.value = true
  }

  const showConfirmPopUp = ref(false)
  const confirmSuccess = () => {
    deleteTag(selectedDeleteId.value)
    showConfirmPopUp.value = false
  }
  const confirmCancel = () => {
    selectedDeleteId.value = null
    showConfirmPopUp.value = false
  }

  const showPopUpTag = ref(false)
  const openPopUpTag = () => {
    showPopUpTag.value = true
  }
  const closePopUpTag = () => {
    showPopUpTag.value = false

    selectedTag.value = null
  }

  const searchInterval = ref(null)
  const searchTag = (text) => {
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
      path: '/tags',
      query: params
    })
  }

  const getDataByRouteFilter = () => {
    const query = route.query

    params.page_size = Number(query.page_size) || 100
    params.page = Number(query.page) || 1
    params.search = query.search

    getTags()
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
              <m-button @click="openPopUpTag" icon="addCircle" :title="t('add')" small />
            </div>
            <div class="table__right">
              <m-text-filed
                @updateValue="searchTag"
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
                  <th>{{ t('title') }} RU</th>
                  <th>{{ t('title') }} TM</th>
                  <th>{{ t('color') }}</th>
                  <th>{{ t('status') }}</th>
                  <th width="1">{{ t('action') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(tag, index) in tags">
                  <td @click="selectTag(tag)" class="_cursor-pointer">
                    {{ (params.page - 1) * params.page_size + index + 1 }}
                  </td>
                  <td @click="selectTag(tag)" class="_cursor-pointer">{{ tag.name.ru }}</td>
                  <td @click="selectTag(tag)" class="_cursor-pointer">{{ tag.name.tm }}</td>
                  <td @click="selectTag(tag)" class="_cursor-pointer">
                    <div :style="`--color: ${tag.color}`" class="__color"></div>
                  </td>
                  <td @click="selectTag(tag)" class="_cursor-pointer">
                    <m-badge
                      :title="!!tag.status ? `${t('open')}` : `${t('closed')}`"
                      :styles="!!tag.status ? 'success' : 'danger'"
                      outline
                    />
                  </td>
                  <td>
                    <m-button @click="selectDelete(tag.id)" icon="delete" styles="danger" outline only-icon />
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
    <pop-up-tag @save="saveTag" @close="closePopUpTag" :item="selectedTag" :loading="loading" v-if="showPopUpTag" />
    <pop-up-confirm
      @no="confirmCancel"
      @yes="confirmSuccess"
      :title="t('tagLocales.deleteTagText')"
      v-if="showConfirmPopUp"
    />
  </teleport>
</template>

<style lang="scss" scoped>
  .__color {
    width: 25px;
    height: 25px;
    border-radius: 50%;
    background-color: var(--color);
  }
</style>

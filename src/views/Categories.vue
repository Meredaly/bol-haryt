<script setup>
  import { ref, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { Container, Draggable } from 'vue3-smooth-dnd'
  import { useI18n } from 'vue-i18n'

  import MButton from '@/UI/MButton.vue'
  import MImage from '@/UI/MImage.vue'
  import MTextFiled from '@/UI/MTextFiled.vue'
  import MBadge from '@/UI/MBadge.vue'
  import CategoryInner from '@/components/CategoryInner.vue'
  import PopUpCategory from '@/components/popUps/PopUpCategory.vue'
  import PopUpConfirm from '@/components/popUps/PopUpConfirm.vue'

  import {
    GET_CATEGORIES,
    ADD_CATEGORY,
    DELETE_CATEGORY,
    EDIT_CATEGORY,
    EDIT_CATEGORY_POSITIONS
  } from '@/api/category.api'

  import { applyDrag } from '@/helpers/dnd'
  import { useToast } from '@/store/toast'

  const route = useRoute()
  const router = useRouter()
  const { t } = useI18n()

  const toast = useToast()

  const search = ref('')

  const categories = ref([])
  const getCategories = async () => {
    try {
      const { data } = await GET_CATEGORIES({
        params: {
          lang: 'all',
          search: search.value
        }
      })
      categories.value = data || []
    } catch (error) {
      console.error(error)
    }
  }

  const loading = ref(false)
  const saveCategory = async ({ id, form }) => {
    try {
      loading.value = true
      if (id) {
        await EDIT_CATEGORY({ id, data: form })
      } else {
        await ADD_CATEGORY(form)
      }
      closePopUpCategory()
      getCategories()

      toast.addToast({
        text: `${t('categoryLocales.categorySaved')}`
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

  const deleteCategory = async (id) => {
    try {
      await DELETE_CATEGORY({ id })

      getCategories()
    } catch (error) {
      console.error(error)
    }
  }

  const selectedDeleteId = ref(null)
  const selectDelete = (id) => {
    selectedDeleteId.value = id
    showConfirmPopUp.value = true
  }

  const showConfirmPopUp = ref(false)
  const confirmSuccess = () => {
    deleteCategory(selectedDeleteId.value)
    showConfirmPopUp.value = false
  }
  const confirmCancel = () => {
    selectedDeleteId.value = null
    showConfirmPopUp.value = false
  }

  const selectedCategory = ref(null)
  const selectCategory = (category) => {
    selectedCategory.value = category
    selectedParentId.value = category.parent_id
    openPopUpCategory()
  }

  const selectedParentId = ref('')
  const addSub = (id) => {
    selectedParentId.value = id
    openPopUpCategory()
  }

  const showSubId = ref(null)
  const showSubItems = (id) => {
    showSubId.value = showSubId.value === id ? null : id
  }

  const showPopUpCategory = ref(false)
  const openPopUpCategory = () => {
    showPopUpCategory.value = true
  }
  const closePopUpCategory = () => {
    showPopUpCategory.value = false
    selectedParentId.value = ''
    selectedCategory.value = null
  }

  const editCategoryPositions = async (categories) => {
    try {
      const categoriesPosition = categories.map((category, index) => {
        return {
          id: category.id,
          order: index + 1
        }
      })

      await EDIT_CATEGORY_POSITIONS({
        data: categoriesPosition
      })

      getCategories()
    } catch (error) {
      console.error(error)
    }
  }

  const dragDropSubCategory = (subCategories) => {
    editCategoryPositions(subCategories)
  }

  const onDrop = (dropResult) => {
    categories.value = applyDrag(categories.value, dropResult)

    editCategoryPositions(categories.value)
  }

  const searchInterval = ref(null)
  const searchCategory = (text) => {
    search.value = text

    clearTimeout(searchInterval.value)
    searchInterval.value = setTimeout(() => {
      pushByParams()
    }, 500)
  }

  const pushByParams = () => {
    router.push({
      path: '/categories',
      query: {
        search: search.value
      }
    })
  }

  const getDataByRouteFilter = () => {
    const query = route.query

    search.value = query.search

    getCategories()
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
              <m-button @click="openPopUpCategory" icon="addCircle" :title="t('add')" small />
            </div>
            <div class="table__right">
              <m-text-filed
                @updateValue="searchCategory"
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
                    <div class="drag-table__col chevron-width"></div>
                    <div class="drag-table__col number-width">№</div>
                    <div class="drag-table__col image-width">{{ t('photo') }}</div>
                    <div class="drag-table__col">{{ t('name') }}(RU)</div>
                    <div class="drag-table__col">{{ t('name') }}(TM)</div>
                    <div class="drag-table__col status-width">{{ t('categoryLocales.commission') }}</div>
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
                <Draggable v-for="(category, index) in categories" :key="category.id" class="drag-table__row">
                  <div class="drag-table__row-wrapper">
                    <div class="drag-table__col drag-width">
                      <m-button icon="reOrderDots" styles="light" only-icon class="column-drag-handle" />
                    </div>
                    <div class="drag-table__col chevron-width">
                      <m-button
                        @click="showSubItems(category.id)"
                        :class="{ 'rotate-180': category.id === showSubId }"
                        v-if="category.child"
                        icon="chevronBottom"
                        styles="light"
                        only-icon
                      />
                    </div>
                    <div class="drag-table__col number-width">{{ index + 1 }}</div>
                    <div @click="selectCategory(category)" class="drag-table__col image-width _cursor-pointer">
                      <m-image :image="category.image" width="80px" height="80px" />
                    </div>
                    <div @click="selectCategory(category)" class="drag-table__col _cursor-pointer">
                      {{ category.name.ru }}
                    </div>
                    <div @click="selectCategory(category)" class="drag-table__col _cursor-pointer">
                      {{ category.name.tm }}
                    </div>
                    <div @click="selectCategory(category)" class="drag-table__col status-width _cursor-pointer">
                      {{ category.fee }}%
                    </div>
                    <div @click="selectCategory(category)" class="drag-table__col status-width _cursor-pointer">
                      <m-badge
                        :title="!!category.status ? `${t('open')}` : `${t('closed')}`"
                        :styles="!!category.status ? 'success' : 'danger'"
                        outline
                      />
                    </div>
                    <div class="drag-table__col action-width flex gap-10">
                      <m-button @click="addSub(category.id)" icon="addCircle" only-icon />
                      <m-button @click="selectDelete(category.id)" icon="delete" styles="danger" outline only-icon />
                    </div>
                  </div>
                  <category-inner
                    @select-item="selectCategory"
                    @add="addSub"
                    @dragDrop="dragDropSubCategory"
                    @delete="selectDelete"
                    :items="category.child"
                    v-if="category.id === showSubId && category.child"
                  />
                </Draggable>
              </Container>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <teleport to="#pop-up">
    <pop-up-category
      @save="saveCategory"
      @close="closePopUpCategory"
      :item="selectedCategory"
      :parent-id="selectedParentId"
      :category-items="categories"
      :loading="loading"
      v-if="showPopUpCategory"
    />
    <pop-up-confirm
      @no="confirmCancel"
      @yes="confirmSuccess"
      :title="t('categoryLocales.deleteCategoryText')"
      v-if="showConfirmPopUp"
    />
  </teleport>
</template>

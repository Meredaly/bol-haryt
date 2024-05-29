<script setup>
  import { ref, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { Container, Draggable } from 'vue3-smooth-dnd'
  import { useI18n } from 'vue-i18n'

  import MButton from '@/UI/MButton.vue'
  import MTextFiled from '@/UI/MTextFiled.vue'
  import LocationInner from '@/components/LocationInner.vue'
  import PopUpLocation from '@/components/popUps/PopUpLocation.vue'
  import PopUpConfirm from '@/components/popUps/PopUpConfirm.vue'
  import PopUpLocationShipping from '@/components/popUps/PopUpLocationShipping.vue'

  import { applyDrag } from '@/helpers/dnd'
  import { useToast } from '@/store/toast'

  import {
    GET_LOCATIONS,
    ADD_LOCATION,
    DELETE_LOCATION,
    EDIT_LOCATION,
    EDIT_LOCATION_POSITIONS
  } from '@/api/location.api'

  const route = useRoute()
  const router = useRouter()
  const { t } = useI18n()

  const toast = useToast()

  const search = ref('')

  const locations = ref([])
  const locationsCategory = ref([])
  const getLocations = async () => {
    try {
      const { data } = await GET_LOCATIONS({
        params: {
          search: search.value,
          lang: 'all'
        }
      })
      locations.value = data || []

      locationsCategory.value = data.map((location) => {
        return {
          ...location,
          child: []
        }
      })
    } catch (error) {
      console.error(error)
    }
  }

  const loading = ref(false)
  const saveLocation = async ({ id, form }) => {
    try {
      loading.value = true
      if (id) {
        await EDIT_LOCATION({ id, data: form })
      } else {
        await ADD_LOCATION(form)
      }
      closePopUpLocation()
      closePopUpLocationShipping()
      getLocations()

      toast.addToast({
        text: `${t('locations.locationSaved')}`
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

  const deleteLocation = async (id) => {
    try {
      await DELETE_LOCATION({ id })

      getLocations()
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
    deleteLocation(selectedDeleteId.value)
    showConfirmPopUp.value = false
  }
  const confirmCancel = () => {
    selectedDeleteId.value = null
    showConfirmPopUp.value = false
  }

  const selectedLocation = ref(null)
  const selectLocation = (category) => {
    selectedLocation.value = category
    selectedParentId.value = category.parent_id
    openPopUpLocation()
  }

  const selectedParentId = ref('')

  const showSubId = ref(null)
  const showSubItems = (id) => {
    showSubId.value = showSubId.value === id ? null : id
  }

  const showPopUpLocation = ref(false)
  const openPopUpLocation = () => {
    showPopUpLocation.value = true
  }
  const closePopUpLocation = () => {
    showPopUpLocation.value = false
    selectedParentId.value = ''
    selectedLocation.value = null
  }

  const selectedLocationShipping = ref(null)
  const selectLocationShipping = (shippings) => {
    selectedLocationShipping.value = shippings
    selectedParentShippingId.value = ''
    openPopUpLocationShipping()
  }

  const selectedParentShippingId = ref('')
  const addSubShipping = (id) => {
    selectedParentShippingId.value = id
    openPopUpLocationShipping()
  }

  const showPopUpLocationShipping = ref(false)
  const openPopUpLocationShipping = () => {
    showPopUpLocationShipping.value = true
  }

  const closePopUpLocationShipping = () => {
    showPopUpLocationShipping.value = false
    selectedLocationShipping.value = null
  }

  const editLocationPositions = async (locations) => {
    try {
      const locationsPosition = locations.map((location, index) => {
        return {
          id: location.id,
          order: index + 1
        }
      })

      await EDIT_LOCATION_POSITIONS({
        data: locationsPosition
      })

      getLocations()
    } catch (error) {
      console.error(error)
    }
  }

  const dragDropSubLocation = (subCategories) => {
    editLocationPositions(subCategories)
  }

  const onDrop = (dropResult) => {
    locations.value = applyDrag(locations.value, dropResult)

    editLocationPositions(locations.value)
  }

  const searchInterval = ref(null)
  const searchLocation = (text) => {
    search.value = text
    clearTimeout(searchInterval.value)
    searchInterval.value = setTimeout(() => {
      pushByParams()
    }, 500)
  }

  const pushByParams = () => {
    router.push({
      path: '/locations',
      query: {
        search: search.value
      }
    })
  }

  const getDataByRouteFilter = () => {
    const query = route.query

    search.value = query.search

    getLocations()
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
              <m-button @click="openPopUpLocation" icon="addCircle" :title="t('add')" small />
            </div>
            <div class="table__right">
              <m-text-filed
                @updateValue="searchLocation"
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
                    <div class="drag-table__col">{{ t('name') }}(RU)</div>
                    <div class="drag-table__col">{{ t('name') }}(TM)</div>
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
                <Draggable v-for="(category, index) in locations" :key="category.id" class="drag-table__row">
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
                    <div @click="selectLocation(category)" class="drag-table__col _cursor-pointer">
                      {{ category.name.ru }}
                    </div>
                    <div @click="selectLocation(category)" class="drag-table__col _cursor-pointer">
                      {{ category.name.tm }}
                    </div>
                    <div class="drag-table__col action-width flex gap-10">
                      <m-button @click="addSubShipping(category.id)" icon="addCircle" only-icon />
                      <m-button @click="selectDelete(category.id)" icon="delete" styles="danger" outline only-icon />
                    </div>
                  </div>
                  <location-inner
                    @select-item="selectLocationShipping"
                    @delete="selectDelete"
                    @drag-drop="dragDropSubLocation"
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
    <pop-up-location
      @save="saveLocation"
      @close="closePopUpLocation"
      :item="selectedLocation"
      :loading="loading"
      v-if="showPopUpLocation"
    />
    <pop-up-location-shipping
      @save="saveLocation"
      @close="closePopUpLocationShipping"
      :shippings="selectedLocationShipping"
      :parent-id="selectedParentShippingId"
      :loading="loading"
      v-if="showPopUpLocationShipping"
    />
    <pop-up-confirm
      @no="confirmCancel"
      @yes="confirmSuccess"
      :title="t('locations.deletedLocationText')"
      v-if="showConfirmPopUp"
    />
  </teleport>
</template>

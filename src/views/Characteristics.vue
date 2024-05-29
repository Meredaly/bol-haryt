<script setup>
  import { ref, watch, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { Container, Draggable } from 'vue3-smooth-dnd'
  import { useI18n } from 'vue-i18n'

  import MButton from '@/UI/MButton.vue'
  import MTextFiled from '@/UI/MTextFiled.vue'
  import MBadge from '@/UI/MBadge.vue'
  import CharacteristicOptions from '@/components/CharacteristicOptions.vue'
  import PopUpCharacteristic from '@/components/popUps/PopUpCharacteristic.vue'
  import PopUpCharacteristicOption from '@/components/popUps/PopUpCharacteristicOption.vue'
  import PopUpConfirm from '@/components/popUps/PopUpConfirm.vue'
  import { useCategories } from '@/composables/productCategories'

  import {
    GET_CHARACTERISTICS,
    ADD_CHARACTERISTIC,
    EDIT_CHARACTERISTIC,
    DELETE_CHARACTERISTIC,
    ADD_OPTION,
    EDIT_OPTION,
    DELETE_OPTION,
    EDIT_CHARACTERISTIC_POSITIONS,
    EDIT_SUB_CHARACTERISTIC_POSITIONS
  } from '@/api/characteristics.api'

  import { applyDrag } from '@/helpers/dnd'
  import { useToast } from '@/store/toast'

  const route = useRoute()
  const router = useRouter()
  const { t, locale } = useI18n()

  const { categories, getMainCategories, getCategories, findSelectedCategory } = useCategories()

  const toast = useToast()

  const search = ref('')

  const characteristics = ref([])
  const getCharacteristics = async () => {
    try {
      const { data } = await GET_CHARACTERISTICS({
        params: {
          lang: 'all',
          search: search.value
        }
      })
      characteristics.value = data || []
    } catch (error) {
      console.error(error)
    }
  }

  const loading = ref(false)
  const saveCharacteristic = async ({ id, form }) => {
    try {
      loading.value = true
      if (id) {
        await EDIT_CHARACTERISTIC({ id, data: form })
      } else {
        await ADD_CHARACTERISTIC(form)
      }
      closePopUpCharacteristic()
      getCharacteristics()

      toast.addToast({
        text: `${t('charecteristics.characteristicSaved')}`
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

  const deleteCharacteristic = async (id) => {
    try {
      await DELETE_CHARACTERISTIC({ id })

      getCharacteristics()
    } catch (error) {
      console.error(error)
    }
  }

  const selectedCharacteristic = ref(null)
  const selectCharacteristic = (characteristic) => {
    selectedCharacteristic.value = characteristic
    openPopUpCharacteristic()
  }

  const selectedDeleteCharacteristicId = ref(null)
  const selectDeleteCharacteristic = (id) => {
    selectedDeleteCharacteristicId.value = id
    showConfirmCharacteristicPopUp.value = true
  }

  const showConfirmCharacteristicPopUp = ref(false)
  const confirmSuccessCharacteristic = () => {
    deleteCharacteristic(selectedDeleteCharacteristicId.value)
    showConfirmCharacteristicPopUp.value = false
  }
  const confirmCancelCharacteristic = () => {
    selectedDeleteCharacteristicId.value = null
    showConfirmCharacteristicPopUp.value = false
  }

  const showPopUpCharacteristic = ref(false)
  const openPopUpCharacteristic = () => {
    showPopUpCharacteristic.value = true
  }
  const closePopUpCharacteristic = () => {
    showPopUpCharacteristic.value = false
    selectedCharacteristic.value = null
  }

  const loadingOption = ref(false)
  const saveOption = async ({ id, form, characteristicId }) => {
    loadingOption.value = true
    try {
      if (id) {
        await EDIT_OPTION({ id, data: form, characteristicId })
      } else {
        await ADD_OPTION({ data: form, characteristicId })
      }
      closePopUpOption()
      getCharacteristics()

      toast.addToast({
        text: `${t('charecteristics.characteristicSaved')}`
      })
    } catch (error) {
      console.error(error)
      toast.addToast({
        text: `${t('categoryLocales.serverProblems')}`,
        status: 'error'
      })
    } finally {
      loadingOption.value = false
    }
  }

  const deleteOption = async (data) => {
    try {
      await DELETE_OPTION(data)

      getCharacteristics()
    } catch (error) {
      console.error(error)
    }
  }

  const showOptionsId = ref(null)
  const showOptions = (id) => {
    showOptionsId.value = showOptionsId.value === id ? null : id
  }

  const selectedOption = ref(null)
  const selectOption = (option, characteristicId) => {
    selectedOption.value = option
    openPopUpOption(characteristicId)
  }

  const selectedDeleteOptionId = ref(null)
  const selectDeleteOption = (characteristicId, optionId) => {
    selectedDeleteOptionId.value = { characteristicId, optionId }
    showConfirmOptionPopUp.value = true
  }

  const showConfirmOptionPopUp = ref(false)
  const confirmSuccessOption = () => {
    deleteOption(selectedDeleteOptionId.value)
    showConfirmOptionPopUp.value = false
  }
  const confirmCancelOption = () => {
    selectedDeleteOptionId.value = null
    showConfirmOptionPopUp.value = false
  }

  const selectedCharacteristicId = ref(null)
  const showPopUpOption = ref(false)
  const openPopUpOption = (characteristicId) => {
    showPopUpOption.value = true
    selectedCharacteristicId.value = characteristicId
  }
  const closePopUpOption = () => {
    showPopUpOption.value = false
    selectedCharacteristicId.value = null
    selectedOption.value = null
  }

  const editCharacteristicPositions = async (characteristics) => {
    try {
      const characteristicPosition = characteristics.map((subCharacteristic, index) => {
        return {
          id: subCharacteristic.id,
          order: index + 1
        }
      })

      await EDIT_CHARACTERISTIC_POSITIONS({
        data: characteristicPosition
      })
    } catch (error) {
      console.error(error)
    }
  }

  const editSubCharacteristicPositions = async (characteristics) => {
    try {
      const characteristicPosition = characteristics.map((subCharacteristic, index) => {
        return {
          id: subCharacteristic.id,
          order: index + 1
        }
      })

      await EDIT_SUB_CHARACTERISTIC_POSITIONS({
        data: characteristicPosition
      })
    } catch (error) {
      console.error(error)
    }
  }

  const dragDropSubCharacteristic = (subCharacteristics) => {
    editSubCharacteristicPositions(subCharacteristics)
  }

  const onDrop = (dropResult) => {
    characteristics.value = applyDrag(characteristics.value, dropResult)

    editCharacteristicPositions(characteristics.value)
  }

  const searchInterval = ref(null)
  const searchCharacteristic = (text) => {
    search.value = text
    clearTimeout(searchInterval.value)
    searchInterval.value = setTimeout(() => {
      pushByParams()
    }, 500)
  }

  const pushByParams = () => {
    router.push({
      path: '/characteristics',
      query: {
        search: search.value
      }
    })
  }

  const getDataByRouteFilter = () => {
    const query = route.query

    search.value = query.search

    getCharacteristics()
  }

  const getTitleByCategory = (category) => {
    const cat = findSelectedCategory(category, categories.value)
    return cat?.name || ''
  }

  onMounted(async () => {
    await getMainCategories()
    getCategories()

    watch(
      () => route.fullPath,
      () => {
        getDataByRouteFilter()
      },
      { immediate: true }
    )
  })
</script>

<template>
  <div class="page">
    <div class="page__wrapper">
      <div class="page__body _no-head">
        <div class="table">
          <div class="table__head">
            <div class="table__left">
              <m-button @click="openPopUpCharacteristic" icon="addCircle" :title="t('add')" small />
            </div>
            <div class="table__right">
              <m-text-filed
                @updateValue="searchCharacteristic"
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
                    <div class="drag-table__col">{{ t('categories') }}</div>
                    <div class="drag-table__col">{{ t('description') }}</div>
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
                <Draggable
                  v-for="(characteristic, index) in characteristics"
                  :key="characteristic.id"
                  class="drag-table__row"
                >
                  <div class="drag-table__row-wrapper">
                    <div class="drag-table__col drag-width">
                      <m-button icon="reOrderDots" styles="light" only-icon class="column-drag-handle" />
                    </div>
                    <div @click="showOptions(characteristic.id)" class="drag-table__col chevron-width">
                      <m-button
                        v-if="characteristic.value?.length"
                        :class="{ 'rotate-180': characteristic.id === showOptionsId }"
                        icon="chevronBottom"
                        styles="light"
                        only-icon
                      />
                    </div>
                    <div
                      @click="selectCharacteristic(characteristic)"
                      class="drag-table__col number-width _cursor-pointer"
                    >
                      {{ index + 1 }}
                    </div>
                    <div @click="selectCharacteristic(characteristic)" class="drag-table__col _cursor-pointer">
                      {{ characteristic.name.ru }}
                    </div>
                    <div @click="selectCharacteristic(characteristic)" class="drag-table__col _cursor-pointer">
                      {{ characteristic.name.tm }}
                    </div>
                    <div @click="selectCharacteristic(characteristic)" class="drag-table__col _cursor-pointer">
                      <div class="flex flex-wrap gap-10">
                        <m-badge
                          v-for="categoryItem in characteristic.category"
                          :title="getTitleByCategory(categoryItem)"
                          styles="secondary"
                          outline
                        />
                      </div>
                    </div>
                    <div @click="selectCharacteristic(characteristic)" class="drag-table__col _cursor-pointer">
                      {{ characteristic.description }}
                    </div>
                    <div
                      @click="selectCharacteristic(characteristic)"
                      class="drag-table__col status-width _cursor-pointer"
                    >
                      <m-badge
                        :title="!!characteristic.status ? `${t('open')}` : `${t('closed')}`"
                        :styles="!!characteristic.status ? 'success' : 'danger'"
                        outline
                      />
                    </div>
                    <div class="drag-table__col action-width flex flex-x-end gap-10">
                      <m-button @click="openPopUpOption(characteristic.id)" icon="addCircle" only-icon />
                      <m-button
                        @click="selectDeleteCharacteristic(characteristic.id)"
                        icon="delete"
                        styles="danger"
                        outline
                        only-icon
                      />
                    </div>
                  </div>
                  <characteristic-options
                    @select-item="(option) => selectOption(option, characteristic.id)"
                    @delete="(optionId) => selectDeleteOption(characteristic.id, optionId)"
                    @dragDrop="dragDropSubCharacteristic"
                    :items="characteristic.value"
                    v-if="characteristic.id === showOptionsId && characteristic.value?.length"
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
    <pop-up-characteristic
      @save="saveCharacteristic"
      @close="closePopUpCharacteristic"
      :loading="loading"
      :item="selectedCharacteristic"
      v-if="showPopUpCharacteristic"
    />
    <pop-up-characteristic-option
      @save="saveOption"
      @close="closePopUpOption"
      :loading="loadingOption"
      :item="selectedOption"
      :characteristicId="selectedCharacteristicId"
      v-if="showPopUpOption"
    />

    <pop-up-confirm
      @yes="confirmSuccessCharacteristic"
      @no="confirmCancelCharacteristic"
      v-if="showConfirmCharacteristicPopUp"
      :title="t('charecteristics.deleteCharecteristicsText')"
    />
    <pop-up-confirm
      @yes="confirmSuccessOption"
      @no="confirmCancelOption"
      v-if="showConfirmOptionPopUp"
      :title="t('charecteristics.deleteOptionText')"
    />
  </teleport>
</template>

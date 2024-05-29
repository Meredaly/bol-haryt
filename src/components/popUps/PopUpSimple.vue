<template>
  <m-pop-up-body width="900" title="Pop up simple">
    <m-row row-gap="15">
      <m-col cols="12">
        <m-text-filed label="Название" background />
      </m-col>
      <m-col cols="12">
        <m-dropdown
          @select-item="selectDropdownItem"
          :selected-item="selectedDropdownItem"
          :items="dropdownMenu"
          background
          label="Название"
          placeholder="plaseholder"
        />
      </m-col>
      <m-col cols="12">
        <m-textarea label="Название" background />
      </m-col>
      <m-col cols="6">
        <m-checkbox :status="checkbox" disabled @updateStatus="(newStatus) => (checkbox = newStatus)" title="Phone" />
      </m-col>
      <m-col cols="6">
        <m-radio :status="radio" redio @updateStatus="(newStatus) => (radio = newStatus)" title="Phone" />
      </m-col>
    </m-row>
    <template v-slot:bot>
      <div class="flex flex-x-end gap-20">
        <m-button @click="close" title="Отмена" styles="light" />
        <m-button @click="save" title="Сохранить" />
      </div>
    </template>
  </m-pop-up-body>
</template>

<script setup>
  import MButton from '@/UI/MButton.vue'
  import MTextFiled from '@/UI/MTextFiled.vue'
  import MDropdown from '@/UI/MDropdown.vue'
  import MTextarea from '@/UI/MTextarea.vue'
  import MCheckbox from '@/UI/MCheckbox.vue'
  import MRadio from '@/UI/MRadio.vue'
  import MRow from '@/UI/MRow.vue'
  import MCol from '@/UI/MCol.vue'
  import MPopUpBody from '@/UI/MPopUpBody.vue'
  import { ref } from 'vue'

  const emit = defineEmits(['close', 'save'])

  const dropdownMenu = ref([
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
    { id: 3, name: 'Item 3' },
    { id: 4, name: 'Item 4' },
    { id: 5, name: 'Item 5' },
    { id: 6, name: 'Item 6' },
    { id: 7, name: 'Item 7' },
    { id: 8, name: 'Item 8' },
    { id: 9, name: 'Item 9' },
    { id: 10, name: 'Item 10' }
  ])
  const checkbox = ref(true)
  const radio = ref(false)
  const selectedDropdownItem = ref(null)
  const selectDropdownItem = (item) => {
    selectedDropdownItem.value = item
  }
  const close = () => {
    emit('close')
  }
  const save = () => {
    emit('save', form)
  }
</script>

<style lang="scss" scoped></style>

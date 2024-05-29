<script setup>
  import { ref, watchEffect } from 'vue'
  import { Container, Draggable } from 'vue3-smooth-dnd'
  import MButton from '@/UI/MButton.vue'
  import { applyDrag } from '@/helpers/dnd'

  const emit = defineEmits(['delete', 'selectItem', 'dragDrop'])

  const props = defineProps({
    items: { type: Array, default: () => [] }
  })

  const options = ref([])
  watchEffect(() => {
    options.value = JSON.parse(JSON.stringify(props.items))
  })

  const selectOption = (option) => {
    emit('selectItem', option)
  }
  const deleteOption = (id) => {
    emit('delete', id)
  }

  const onDrop = (dropResult) => {
    options.value = applyDrag(options.value, dropResult)

    dragDrop(options.value)
  }

  const dragDrop = (items) => {
    emit('dragDrop', items)
  }
</script>

<template>
  <Container
    @drop="onDrop"
    lock-axis="y"
    drag-handle-selector=".column-drag-handle"
    class="drag-table__body drag-table__body_inner"
  >
    <Draggable v-for="(option, index) in options" :key="option.id" class="drag-table__row">
      <div class="drag-table__row-wrapper">
        <div class="drag-table__col drag-width">
          <m-button icon="reOrderDots" styles="light" only-icon class="column-drag-handle" />
        </div>
        <div @click="selectOption(option)" class="drag-table__col number-width _cursor-pointer">{{ index + 1 }}</div>
        <div @click="selectOption(option)" class="drag-table__col _cursor-pointer">{{ option.name.ru }}</div>
        <div @click="selectOption(option)" class="drag-table__col _cursor-pointer">{{ option.name.tm }}</div>
        <div @click="selectOption(option)" class="drag-table__col _cursor-pointer">{{ option.name.value }}</div>
        <div class="drag-table__col action-width flex flex-x-end">
          <m-button @click="deleteOption(option.id)" icon="delete" styles="danger" outline only-icon />
        </div>
      </div>
    </Draggable>
  </Container>
</template>

<style lang="scss" scoped></style>

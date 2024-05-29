<script setup>
  import { ref, watchEffect } from 'vue'
  import { Container, Draggable } from 'vue3-smooth-dnd'
  import MButton from '@/UI/MButton.vue'
  import MImage from '@/UI/MImage.vue'
  import MBadge from '@/UI/MBadge.vue'
  import CategoryInner from '@/components/CategoryInner.vue'

  import { applyDrag } from '@/helpers/dnd'

  const emit = defineEmits(['add', 'delete', 'selectItem', 'dragDrop'])

  const props = defineProps({
    items: { type: Array, default: () => [] }
  })

  const addSubItem = (id) => {
    emit('add', id)
  }

  const deleteItem = (id) => {
    emit('delete', id)
  }

  const showSubId = ref(null)
  const showSubItems = (id) => {
    showSubId.value = showSubId.value === id ? null : id
  }

  const selectItem = (category) => {
    emit('selectItem', category)
  }

  const subCategories = ref([])
  watchEffect(() => {
    subCategories.value = JSON.parse(JSON.stringify(props.items))
  })

  const onDrop = (dropResult) => {
    subCategories.value = applyDrag(subCategories.value, dropResult)

    dragDrop(subCategories.value)
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
    <Draggable v-for="(item, index) in subCategories" :key="item.id" class="drag-table__row">
      <div class="drag-table__row-wrapper">
        <div class="drag-table__col drag-width">
          <m-button icon="reOrderDots" styles="light" only-icon class="column-drag-handle" />
        </div>
        <div class="drag-table__col chevron-width">
          <m-button
            @click="showSubItems(item.id)"
            :class="{ 'rotate-180': item.id === showSubId }"
            v-if="item.child"
            icon="chevronBottom"
            styles="light"
            only-icon
          />
        </div>
        <div @click="selectItem(item)" class="drag-table__col number-width _cursor-pointer">{{ index + 1 }}</div>
        <div @click="selectItem(item)" class="drag-table__col image-width _cursor-pointer">
          <m-image :image="item.image" width="60px" height="60px" />
        </div>
        <div @click="selectItem(item)" class="drag-table__col _cursor-pointer">{{ item.name.ru }}</div>
        <div @click="selectItem(item)" class="drag-table__col _cursor-pointer">{{ item.name.tm }}</div>
        <div @click="selectItem(item)" class="drag-table__col status-width _cursor-pointer">{{ item.fee }}%</div>
        <div @click="selectItem(item)" class="drag-table__col status-width _cursor-pointer">
          <m-badge
            :title="!!item.status ? 'Открыть' : 'Закрыть'"
            :styles="!!item.status ? 'success' : 'danger'"
            outline
          />
        </div>
        <div class="drag-table__col action-width flex gap-10">
          <m-button @click="addSubItem(item.id)" icon="addCircle" only-icon class="ml-a" />
          <m-button @click="deleteItem(item.id)" icon="delete" styles="danger" outline only-icon class="ml-a" />
        </div>
      </div>
      <category-inner
        @select-item="selectItem"
        @add="addSubItem"
        @drag-drop="dragDrop"
        @delete="deleteItem"
        :items="item.child"
        v-if="item.id === showSubId && item.child"
      />
    </Draggable>
  </Container>
</template>

<style lang="scss" scoped></style>

<script setup>
  import { ref, watchEffect } from 'vue'
  import { Container, Draggable } from 'vue3-smooth-dnd'
  import MButton from '@/UI/MButton.vue'

  import { applyDrag } from '@/helpers/dnd'

  const emit = defineEmits(['delete', 'selectItem', 'dragDrop'])

  const props = defineProps({
    items: { type: Array, default: () => [] }
  })

  const subLocations = ref([])
  watchEffect(() => {
    subLocations.value = JSON.parse(JSON.stringify(props.items))
  })

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

  const onDrop = (dropResult) => {
    subLocations.value = applyDrag(subLocations.value, dropResult)

    dragDrop(subLocations.value)
  }

  const dragDrop = (items) => {
    emit('dragDrop', items)
  }
</script>

<template>
  <Container @drop="onDrop" lock-axis="y" drag-handle-selector=".column-drag-handle" class="drag-table__body drag-table__body_inner">
    <Draggable v-for="(item, index) in items" :key="item.id" class="drag-table__row">
      <div class="drag-table__row-wrapper">
        <div class="drag-table__col drag-width">
          <m-button icon="reOrderDots" styles="light" only-icon class="column-drag-handle" />
        </div>
        <div class="drag-table__col chevron-width">
          <m-button
            @click="showSubItems(item.id)"
            :class="{ 'rotate-180': item.id === showSubId }"
            v-if="item.shipping?.length"
            icon="chevronBottom"
            styles="light"
            only-icon
          />
        </div>
        <div @click="selectItem(item)" class="drag-table__col number-width _cursor-pointer">{{ index + 1 }}</div>
        <div @click="selectItem(item)" class="drag-table__col _cursor-pointer">{{ item.name.tm }}</div>
        <div @click="selectItem(item)" class="drag-table__col _cursor-pointer">{{ item.name.ru }}</div>
        <div @click="selectItem(item)" class="drag-table__col _cursor-pointer">
          {{ item.payment_methods.map((paymentMethods) => paymentMethods.name.ru).join(', ') || '' }}
        </div>

        <div class="drag-table__col action-width flex gap-10">
          <m-button @click="selectItem(item)" icon="edit" styles="success" only-icon class="ml-a" />
          <m-button @click="deleteItem(item.id)" icon="delete" styles="danger" outline only-icon class="ml-a" />
        </div>
      </div>
      <div v-if="item.shipping && item.id === showSubId" class="drag-table__shippings">
        <div class="shippings">
          <div v-for="shippingItem in item.shipping" class="shippings__item _cursor-pointer">
            <div class="shippings__name">{{ shippingItem.shipping.ru }}</div>
            <div class="shippings__name">{{ shippingItem.shipping_time }}</div>
            <div class="shippings__price">{{ shippingItem.shipping_price }}</div>
          </div>
        </div>
      </div>
    </Draggable>
  </Container>
</template>

<style lang="scss" scoped>
  .drag-table {
    // .drag-table__shippings
    &__shippings {
      margin-bottom: 20px;
    }
  }
  .shippings {
    // .shippings__item
    &__item {
      display: flex;
      padding-left: 210px;
      background-color: var(--white);
      border-bottom: 0.5px solid var(--gray-100);
      border-top: 0.5px solid var(--gray-100);
      color: var(--gray-800);
    }
    // .shippings__name
    &__name {
      flex: 1 1;
      width: 0;
      padding: 10px 24px;
      display: flex;
      align-items: center;
    }
    // .shippings__price
    &__price {
      flex: 1 1;
      width: 0;
      padding: 10px 24px;
      display: flex;
      align-items: center;
    }
    // .shippings__delete
    &__delete {
      padding: 10px 24px;
    }
  }
  .ml-a {
  }
</style>

<script setup>
  import { ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import MButton from '@/UI/MButton.vue'
  import MImage from '@/UI/MImage.vue'
  import MTextFiled from '@/UI/MTextFiled.vue'

  import { GET_ORDER } from '@/api/order.api'

  const route = useRoute()
  const router = useRouter()

  const order = ref({
    id: null,
    client: null,
    code: null,
    note: '',
    number: '',
    region: null,
    address: '',
    shipping: null,
    created_at: '',
    updated_at: '',
    total_price: 0,
    payment: null,
    seller: []
  })

  const getOrder = async () => {
    try {
      const { data } = await GET_ORDER({ id: route.params.id, params: { lang: 'all' } })
      data.shipping = {
        id: data.shipping.id,
        name: data.shipping.shipping,
        price: data.shipping.shipping_price
      }
      if (data.payment) {
        data.payment = {
          ...data.payment,
          name: data.payment.name.ru
        }
      }
      if (data.region) {
        data.region = {
          ...data.region,
          name: data.region.name.ru
        }
      }
      if (data.shipping) {
        data.shipping = {
          ...data.shipping,
          name: data.shipping.name.ru
        }
      }
      if (data.seller) {
        data.seller.map((seller) => {
          seller.products?.map((product) => {
            if (product?.variant) {
              product.variant.name = product?.variant?.name?.ru || ''
              product.variant.options && (product.variant.options.option.name = product.variant.options.option.name?.ru)
              product.variant.options && (product.variant.options.value.name = product.variant.options.value.name?.ru)
            }
          })
        })
      }
      order.value = data
    } catch (error) {
      console.error(error)
    }
  }

  getOrder()

  const statuses = ref([
    { id: 'AC', name: 'Принят' },
    { id: 'CA', name: 'Отменено' },
    { id: 'RE', name: 'Возврат' },
    { id: 'SE', name: 'Отправка' },
    { id: 'SU', name: 'Завершён' }
  ])

  const getStatus = (statusId) => {
    return statuses.value.find((status) => status.id === statusId)
  }

  const back = () => {
    router.go(-1)
  }
</script>

<template>
  <div class="order">
    <div class="order__header _box">
      <m-button @click="back" title="Назад" icon="chevronLeft" styles="secondary" outline />
      <div class="order__title">Номер заказа: {{ order.code }}</div>
    </div>
    <div class="order__body _custom-scroll">
      <div class="order__items">
        <div v-for="seller in order.seller" :key="seller.id" class="order__item _box">
          <div class="order__products">
            <div v-for="product in seller.products" :key="product.id" class="order__product">
              <div class="order__product-image">
                <m-image :image="product.variant?.image?.thumbnail" width="60px" height="90px" />
              </div>
              <div class="order__product-name">
                {{ product.variant?.name }}
                <p>#{{ product.variant?.code }}</p>
                <p v-if="product.variant?.options">
                  {{ product.variant?.options?.option.name }} {{ product.variant?.options?.value && ', ' + product.variant.options.value?.name }}
                </p>
              </div>
              <div class="order__product-prices">
                <div v-if="Number(product.variant?.discount)" class="order__product-price order__product-price_old">
                  {{ product.variant?.discount }} TMT
                </div>
                <div class="order__product-price">{{ product.variant?.price }} TMT</div>
              </div>
              <div class="order__product-count">
                <m-text-filed v-model="product.count" width="70" disabled background />
              </div>
              <div class="order__product-total-price">{{ (product.variant?.price || 0) * product.count }} TMT</div>
              <div class="order__product-status">
                <m-text-filed :value="getStatus(product.status).name" disabled background width="150" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .order {
    height: 100%;
    // .order__header
    &__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    // .order__title
    &__title {
      font-size: 24px;
      font-weight: 500;
    }
    // .order__body
    &__body {
      height: calc(100% - 104px);
      margin-top: 20px;
      display: flex;
      gap: 20px;
      overflow: auto;
    }
    // .order__items
    &__items {
      flex: 1 1;
    }
    // .order__item
    &__item {
      margin-bottom: 20px;
      padding: 0;
    }
    // .order__shop
    &__shop {
      padding: 20px;
      border-bottom: 1px solid var(--gray-100);
      display: flex;
      align-items: center;
      gap: 10px;
    }
    // .order__shop-image
    &__shop-image {
    }
    // .order__shop-name
    &__shop-name {
      font-size: 16px;
      font-weight: 500;
      flex: 1 1;
    }
    // .order__shop-status
    &__shop-status {
    }
    // .order__products
    &__products {
      padding: 10px;
    }
    // .order__product
    &__product {
      padding: 10px;
      display: flex;
      align-items: center;
      border: 1px solid var(--gray-100);
      border-radius: 10px;
      gap: 10px;
      &:not(:last-child) {
        margin-bottom: 10px;
      }
    }
    // .order__product-image
    &__product-image {
    }
    // .order__product-name
    &__product-name {
      flex: 1 1;
      font-size: 15px;
      font-weight: 500;
    }
    // .order__product-prices
    &__product-prices {
      flex: 1 1;
    }
    // .order__product-price
    &__product-price {
      // .order__product-price_old
      &_old {
        text-decoration: line-through;
        padding-bottom: 4px;
      }
    }
    // .order__product-total-price
    &__product-total-price {
      flex: 1 1;
      font-weight: 500;
      font-size: 18px;
    }
    // .order__product-count
    &__product-count {
      flex: 1 1;
      display: flex;
      align-items: center;
      gap: 5px;
      &:deep() {
        input {
          text-align: center;
        }
      }
    }
    // .order__product-delete
    &__product-delete {
    }
    // .order__info
    &__info {
      width: 300px;
    }
  }

  .order-info {
    padding: 0;
    position: sticky;
    top: 0;
    width: 100%;
    // .order-info__client
    &__client {
    }
    // .order-info__title
    &__title {
      font-size: 16px;
      font-weight: 600;
    }
    // .order-info__client-name
    &__client-name {
      margin-top: 6px;
      font-weight: 500;
    }
    // .order-info__client-phone-number
    &__client-phone-number {
      margin-top: 6px;
    }
    // .order-info__address
    &__address {
      margin-top: 6px;
    }
    // .order-info__address-text
    &__address-text {
      margin-top: 6px;
    }
    // .order-info__info
    &__info {
      margin-top: 10px;
      padding: 0;
    }
    // .order-info__location
    &__location {
      margin-top: 10px;
      padding: 20px 20px 0 20px;
    }
    // .order-info__shipping
    &__shipping {
      margin-top: 10px;
      padding: 0px 20px 0 20px;
    }
    // .order-info__prices
    &__prices {
      border-top: 1px solid var(--gray-200);
      padding: 20px;
      margin-top: 20px;
    }
    // .order-info__price
    &__price {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      &:not(:last-child) {
        border-bottom: 1px solid var(--gray-200);
      }
      &:first-child {
        padding-top: 0;
      }
      &:last-child {
        padding-bottom: 0;
      }
      span {
        display: block;
        font-size: 14px;
        &:last-child {
          font-weight: 600;
        }
      }
    }
    // .order-info__save
    &__save {
      margin-top: 10px;
    }
  }
</style>

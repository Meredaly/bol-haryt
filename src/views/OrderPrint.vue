<script setup>
  import { ref, onMounted } from 'vue'
  import { useRoute } from 'vue-router'
  import { useI18n } from 'vue-i18n'

  import { GET_ORDER } from '@/api/order.api'

  import { getDate } from '@/helpers/date'
  import router from '../router'

  const route = useRoute()
  const { t, locale } = useI18n()

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
        id: data.shipping?.id,
        name: data.shipping?.shipping,
        price: data.shipping?.shipping_price
      }
      if (data.payment) {
        data.payment = {
          ...data.payment,
          name: data.payment.name[locale.value]
        }
      }
      if (data.region) {
        data.region = {
          ...data.region,
          name: data.region.name[locale.value]
        }
      }
      if (data.shipping) {
        data.shipping = {
          ...data.shipping,
          name: data.shipping?.name?.[locale.value] || ''
        }
      }
      if (data.seller) {
        data.seller.map((seller) => {
          seller.products?.map((product) => {
            if (product?.variant) {
              product.variant.name = product?.variant?.name?.[locale.value] || ''
            }
          })
        })
      }
      order.value = data
      setTimeout(() => {
        window.print()
        window.onfocus = function () {
          router.go(-1)
        }
      }, 0)
    } catch (error) {
      console.error(error)
    }
  }

  const getOptionsName = (options) => {
    return (
      options
        ?.map((option) => {
          return [option.option.name[locale.value], option.value.name[locale.value]].join(', ')
        })
        .join('; ') || ''
    )
  }

  onMounted(() => {
    getOrder()
  })
</script>

<template>
  <div class="order-print">
    <div class="order-print__wrapper">
      <div class="order-print__logo">
        <img src="@/assets/images/logo.png" />
      </div>
      <div class="order-print__info">
        <div class="order-print__info-item">
          <div class="order-print__info-item-title">{{ t('orderNumber') }}:</div>
          <div class="order-print__info-item-content">
            <p>{{ order.code }}</p>
          </div>
        </div>
        <div class="order-print__info-item">
          <div class="order-print__info-item-title">{{ t('date') }}:</div>
          <div class="order-print__info-item-content">
            <p>{{ getDate(new Date()) }}</p>
          </div>
        </div>
        <div class="order-print__info-item">
          <div class="order-print__info-item-title">{{ t('client') }}:</div>
          <div class="order-print__info-item-content">
            <p>{{ order.client?.name }}</p>
            <p>{{ order.client?.number }}</p>
          </div>
        </div>
        <div class="order-print__info-item">
          <div class="order-print__info-item-title">{{ t('information') }}:</div>
          <div class="order-print__info-item-content">
            <p>{{ order.address }}</p>
            <p>{{ order.number }}</p>
            <p>{{ order.note }}</p>
          </div>
        </div>
      </div>
      <div class="order-print__table">
        <table>
          <tbody>
            <template v-for="seller in order.seller">
              <tr>
                <th>{{ t('shopName') }}</th>
                <th colspan="6">{{ seller.market_name }}</th>
              </tr>
              <tr>
                <th>{{ t('name') }}</th>
                <th>{{ t('code') }}</th>
                <th>{{ t('option') }}</th>
                <th>{{ t('price') }}</th>
                <th>{{ t('quantity') }}</th>
                <th>{{ t('totalPrice') }}</th>
              </tr>
              <tr v-for="product in seller.products" :key="product.id">
                <td>{{ product.variant?.name }}</td>
                <td>#{{ product.variant?.code }}</td>
                <td>
                  {{ getOptionsName(product.variant.options) }}
                </td>
                <td>{{ product.variant?.price }}</td>
                <td>{{ product.count }}</td>
                <td>{{ (product.variant?.price || 0) * product.count }}</td>
              </tr>
            </template>
            <tr class="order-print__table-bot">
              <th>{{ t('price') }}</th>
              <th colspan="6">{{ order.total_price }} TMT</th>
            </tr>
            <tr v-if="order.shipping?.price" class="order-print__table-bot">
              <th>{{ t('shipping') }}</th>
              <th colspan="6">{{ order.shipping?.price }} TMT</th>
            </tr>
            <tr class="order-print__table-bot">
              <th>{{ t('totalPrice') }}</th>
              <th colspan="6">{{ order.total_price + Number(order.shipping?.price || 0) }} TMT</th>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="order-print__info">
        <div class="order-print__info-item">
          <div class="order-print__info-item-title">{{ t('location') }}:</div>
          <div class="order-print__info-item-content">
            <p>{{ order?.region?.name }}</p>
          </div>
        </div>
        <div class="order-print__info-item">
          <div class="order-print__info-item-title">{{ t('shipping') }}:</div>
          <div class="order-print__info-item-content">
            <p>{{ order?.shipping?.name }}</p>
          </div>
        </div>
        <div class="order-print__info-item">
          <div class="order-print__info-item-title">{{ t('paymentMethod') }}:</div>
          <div class="order-print__info-item-content">
            <p>{{ order?.payment?.name }}</p>
          </div>
        </div>
        <div v-if="order.note" class="order-print__info-item">
          <div class="order-print__info-item-title">{{ t('note') }}:</div>
          <div class="order-print__info-item-content">
            <p>{{ order.note }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  @page {
    size: auto;
    margin: 0mm;
  }
  .order-print {
    min-height: 100%;
    background-color: var(--white);
    padding: 60px 20px 40px 20px;
    // .order-print__wrapper
    &__wrapper {
      width: 100%;
    }
    // .order-print__logo
    &__logo {
      display: flex;
      align-items: center;
      justify-content: center;
      img {
        height: 70px;
      }
    }
    // .order-print__info
    &__info {
      margin-top: 20px;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      grid-gap: 20px;
    }
    // .order-print__info-item
    &__info-item {
      gap: 10px;
    }
    // .order-print__info-item-title
    &__info-item-title {
      font-weight: 500;
      color: var(--gray-800);
    }
    // .order-print__info-item-content
    &__info-item-content {
      margin-top: 5px;
      p {
        font-weight: 400;
        line-height: 1.2;
      }
    }
    // .order-print__table
    &__table {
      margin-top: 30px;

      table {
        width: 100%;
        border-collapse: collapse;
        tr {
          th {
            border: 1px solid var(--gray-800);
            padding: 4px;
            font-size: 12px;
            font-weight: 600;
            color: var(--gray-800);
            text-align: left;
          }
          td {
            border: 1px solid var(--gray-800);
            padding: 4px;
            font-size: 12px;
          }
        }
      }
    }
    // .order-print__table-bot
    &__table-bot {
      th {
        &:last-child {
          text-align: end;
        }
      }
    }
  }
</style>

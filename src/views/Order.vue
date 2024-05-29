<script setup>
  import { ref, computed, watchEffect, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useI18n } from 'vue-i18n'

  import MButton from '@/UI/MButton.vue'
  import MBadge from '@/UI/MBadge.vue'
  import MImage from '@/UI/MImage.vue'
  import MDropdown from '@/UI/MDropdown'
  import MDropdownDots from '@/UI/MDropdownDots'
  import MTextFiled from '@/UI/MTextFiled.vue'
  import MTextarea from '@/UI/MTextarea.vue'

  import { updateCategoryForDropdown } from '@/helpers/normalize'

  import { GET_ORDER, EDIT_ORDER } from '@/api/order.api'
  import { GET_LOCATIONS } from '@/api/location.api'
  import { GET_PAYMENT_METHODS } from '@/api/payment-methods.api'

  import { useToast } from '@/store/toast'

  import { useValidators } from '@/helpers/validators'
  import { normalizePhone } from '@/helpers/normalize'

  const route = useRoute()
  const router = useRouter()
  const toast = useToast()
  const { t, locale } = useI18n()

  const { required, optional } = useValidators()

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

      if (data.seller) {
        data.seller.map((seller) => {
          seller.products?.map((product) => {
            if (product?.variant) {
              product.variant.name = product?.variant?.name?.[locale.value] || ''
            }
          })
        })
      }
      order.value = JSON.parse(JSON.stringify(data))
      if (data.region) {
        selectLocation(data.region)
      }
      if (data.shipping) {
        order.value.shipping = {
          ...data.shipping,
          name: data.shipping?.name?.[locale.value] || ''
        }
      }
    } catch (error) {
      console.error(error)
    }
  }

  const paymentMethods = ref([])
  const getPaymentMethods = async () => {
    try {
      const { data } = await GET_PAYMENT_METHODS({
        params: {
          lang: 'all'
        }
      })
      paymentMethods.value = updateCategoryForDropdown(data || [], '', locale.value)
    } catch (error) {
      console.error(error)
    }
  }

  const selectPaymentMethod = (paymentMethod) => {
    order.value.payment = paymentMethod
  }

  const locations = ref([])
  const getLocations = async () => {
    try {
      const { data } = await GET_LOCATIONS({
        params: {
          lang: 'all'
        }
      })
      locations.value = data || []
      locations.value = updateCategoryForDropdown(data || [], '', locale.value)
    } catch (error) {
      console.error(error)
    }
  }

  const selectLocation = (location) => {
    order.value.region = findLocation(location, locations.value)
    order.value.shipping = null
    shippings.value =
      order.value.region.shipping?.map((shipping) => {
        return {
          id: shipping.id,
          name: shipping.shipping[locale.value],
          price: shipping.shipping_price
        }
      }) || []
  }

  const findLocation = (location, locations) => {
    let findLoc = null
    locations.forEach((loc) => {
      if (loc.sub) {
        const findSub = findLocation(location, loc.sub)
        if (findSub) {
          findLoc = findSub
        }
      }
      if (loc.id === location.id) {
        findLoc = loc
      }
    })
    return JSON.parse(JSON.stringify(findLoc))
  }

  const shippings = ref([])
  const selectShipping = (shipping) => {
    order.value.shipping = shipping
  }

  const form = ref({
    client: null,
    note: null,
    number: null,
    region: null,
    address: null,
    shipping: null,
    payment: null,
    products: []
  })

  const error = ref(false)
  const checkValidation = () => {
    if (required(order.value.region) && required(order.value.shipping) && required(order.value.payment)) {
      error.value = false
      return true
    } else {
      error.value = false
      setTimeout(() => {
        toast.addToast({
          text: t('fillAllFields'),
          status: 'warning'
        })
        error.value = true
      }, 0)
      return false
    }
  }

  const loading = ref(false)
  const saveOrder = async () => {
    if (!checkValidation()) {
      return
    }

    form.value.client = order.value.client.id
    form.value.note = order.value.note
    form.value.number = order.value.number
    form.value.region = order.value.region.id
    form.value.address = order.value.address
    form.value.shipping = order.value.shipping.id
    form.value.payment = order.value.payment.id

    order.value.seller.forEach((shop) => {
      shop.products?.forEach((product) => {
        form.value.products.push({
          variant: product.variant.id,
          count: product.count,
          status: product.status
        })
      })
    })
    loading.value = true
    try {
      await EDIT_ORDER({ id: order.value.id, data: form.value })

      toast.addToast({
        text: t('orderSaved')
      })
      back()
    } catch (error) {
      console.error(error)
      loading.value = false

      toast.addToast({
        text: t('someProblemsWithServer'),
        status: 'error'
      })
    }
  }

  const removeProduct = (seller, index) => {
    form.value.products.push({ method: 'delete', variant: seller.products[index].variant.id })
    seller.products.splice(index, 1)
  }

  watchEffect(() => {
    order.value.total_price = order.value.seller.reduce((sum, shop) => {
      return (
        sum +
        shop.products.reduce((productsSum, product) => {
          return productsSum + product.count * Number(product?.price || 0)
        }, 0)
      )
    }, 0)
  })

  const statuses = computed(() => {
    return [
      { id: 'AC', name: t('accepted') },
      { id: 'CA', name: t('canceled') },
      { id: 'RE', name: t('return') },
      { id: 'SE', name: t('dispatch') },
      { id: 'SU', name: t('completed') }
    ]
  })

  const updateProductStatus = (product, status) => {
    product.status = status.id
  }
  const updateSellerStatus = (seller, status) => {
    seller.products?.forEach((product) => {
      if (product.status !== 'CA') product.status = status.id
    })
  }

  const getStatus = (statusId) => {
    return statuses.value.find((status) => status.id === statusId)
  }

  const addCount = (product) => {
    product.count = product.count + 1
  }
  const decCount = (product) => {
    product.count = product.count - 1
  }
  const printOrder = () => {
    router.push(`/order-print/${route.params.id}`)
  }
  const getOptionName = (option) => {
    return [option.option.name[locale.value], option.value.name[locale.value]].join(', ')
  }

  const back = () => {
    router.go(-1)
  }
  onMounted(async () => {
    await getPaymentMethods()
    await getLocations()
    getOrder()
  })
</script>

<template>
  <div class="order">
    <div class="order__header _box">
      <m-button @click="back" :title="t('back')" icon="chevronLeft" styles="secondary" outline />
      <div class="order__header-right">
        <div class="order__title">{{ t('orderNumber') }}: {{ order.code }}</div>
        <m-button @click="printOrder" onlyIcon icon="print" styles="secondary" />
      </div>
    </div>
    <div class="order__body _custom-scroll">
      <div class="order__items">
        <div v-for="seller in order.seller" :key="seller.id" class="order__item _box">
          <div class="order__shop">
            <div class="order__shop-image">
              <m-image :image="seller.logo" width="40px" height="40px" circle />
            </div>
            <div class="order__shop-name">{{ seller.market_name }}</div>
            <div class="order__shop-status">
              <m-dropdown-dots
                @select-item="(status) => updateSellerStatus(seller, status)"
                :items="statuses"
                :disabled="loading"
                background
              />
            </div>
          </div>
          <div class="order__products">
            <div v-for="(product, index) in seller.products" :key="product.id" class="order__product">
              <div class="order__product-image">
                <m-image :image="product.variant?.image?.thumbnail" width="60px" height="90px" />
              </div>
              <div class="order__product-info">
                {{ product.variant?.name }}
                <p>#{{ product.variant?.code }}</p>
                <div v-if="product.variant?.options" class="order__product-variants">
                  <m-badge
                    v-for="option in product.variant?.options"
                    :title="getOptionName(option)"
                    styles="dark"
                    outline
                  />
                </div>
              </div>
              <div class="order__product-prices">
                <div class="order__product-price">{{ product?.price }} TMT</div>
              </div>
              <div class="order__product-count">
                <m-button
                  @click="decCount(product)"
                  :disabled="product.count <= 1 || loading"
                  icon="subtrack"
                  outline
                  only-icon
                />
                <m-text-filed v-model="product.count" width="70" :disabled="loading" background />
                <m-button @click="addCount(product)" :disabled="loading" icon="add" outline only-icon />
              </div>
              <div class="order__product-total-price">{{ (product?.price || 0) * product.count }} TMT</div>
              <div class="order__product-status">
                <m-dropdown
                  @select-item="(status) => updateProductStatus(product, status)"
                  :selected-item="getStatus(product.status)"
                  :items="statuses"
                  :disabled="loading"
                  background
                  width="150"
                />
              </div>
              <div class="order__product-delete">
                <m-button
                  @click="removeProduct(seller, index)"
                  :disabled="loading"
                  icon="delete"
                  styles="danger"
                  outline
                  only-icon
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="order__info">
        <div class="order-info">
          <div class="order-info__client _box">
            <div class="order-info__title">{{ t('client') }}</div>
            <div class="order-info__client-name">{{ order.client?.name }}</div>
            <div class="order-info__client-phone-number">{{ normalizePhone(order.client?.number) }}</div>
          </div>
          <div class="order-info__address _box">
            <div class="order-info__title">{{ t('information') }}</div>
            <div class="order-info__address-text">{{ order.address }}</div>
            <div class="order-info__address-text">{{ normalizePhone(order?.number) }}</div>
            <div v-if="order.note" class="order-info__address-text">{{ order.note }}</div>
          </div>
          <div class="order-info__info _box">
            <div class="order-info__location">
              <m-dropdown
                @select-item="selectLocation"
                :selected-item="order.region"
                :items="locations"
                :disabled="loading"
                :error="error && optional(order.region)"
                required
                :label="t('location')"
                background
              />
            </div>
            <div class="order-info__shipping">
              <m-dropdown
                @select-item="selectShipping"
                :selected-item="order.shipping"
                :items="shippings"
                :disabled="loading"
                :error="error && optional(order.shipping)"
                required
                :label="t('shipping')"
                background
              />
            </div>
            <div class="order-info__shipping">
              <m-dropdown
                @select-item="selectPaymentMethod"
                :selected-item="order.payment"
                :items="paymentMethods"
                :disabled="loading"
                :error="error && optional(order.payment)"
                required
                :label="t('paymentMethod')"
                background
              />
            </div>
            <div class="order-info__shipping">
              <m-textarea v-model.trim="order.note" :disabled="loading" background :label="t('note')" />
            </div>
            <div class="order-info__prices">
              <div class="order-info__price">
                <span>{{ t('price') }}</span>
                <span>{{ order.total_price }} TMT</span>
              </div>
              <div v-if="order.shipping?.price" class="order-info__price">
                <span>{{ t('shipping') }}</span>
                <span>{{ order.shipping?.price }} TMT</span>
              </div>
              <div class="order-info__price">
                <span>{{ t('totalPrice') }}</span>
                <span>{{ order.total_price + Number(order.shipping?.price || 0) }} TMT</span>
              </div>
            </div>
          </div>
          <div class="order-info__save">
            <m-button @click="saveOrder" :loading="loading" :disabled="loading" :title="t('save')" block />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .order {
    height: 100%;
    @media print {
      display: none;
    }
    // .order__header
    &__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    // .order__header-right
    &__header-right {
      display: flex;
      align-items: center;
      gap: 20px;
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
    // .order__product-info
    &__product-info {
      flex: 1 1;
      font-size: 15px;
      font-weight: 500;
    }
    // .order__product-prices
    &__product-prices {
      width: 100px;
    }
    // .order__product-price
    &__product-price {
      // .order__product-price_old
      &_old {
        text-decoration: line-through;
        padding-bottom: 4px;
      }
    }
    // .order__product-variants
    &__product-variants {
      margin-top: 4px;
      display: flex;
      flex-wrap: wrap;
      gap: 4px 10px;
    }
    // .order__product-total-price
    &__product-total-price {
      width: 150px;
      font-weight: 500;
      font-size: 16px;
    }
    // .order__product-count
    &__product-count {
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

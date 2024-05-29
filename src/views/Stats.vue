<script setup>
  import { ref, onUnmounted } from 'vue'
  import { useI18n } from 'vue-i18n'

  import LineChart from '@/components/LineChart.vue'

  import { DASHBOARD } from '@/api/dashboard.api'

  const { t } = useI18n()

  const orderStats = ref([])

  const gridStats = ref({
    category: { title: 'stats.category', count: 0 },
    client: { title: 'stats.client', count: 0 },
    seller: { title: 'stats.seller', count: 0 },
    empty_product: { title: 'stats.emptyProduct', count: 0 },
    new_products: { title: 'stats.newProduct', count: 0 },
    product: { title: 'stats.product', count: 0 },
    selled_product: { title: 'stats.selledProduct', count: 0 },
    unverify_product: { title: 'stats.unverifyProduct', count: 0 },
    total_fee: { title: 'stats.totalFee', count: 0, double: true }
  })

  function fillMissingDates(data) {
    const result = []
    const dateMap = new Map()

    for (const entry of data) {
      dateMap.set(entry.date, entry.count || 0)
    }

    const dates = Array.from(dateMap.keys()).sort()
    const minDate = new Date(dates[0])
    const maxDate = new Date(dates[dates.length - 1])

    let currentDate = new Date(minDate)
    while (currentDate <= maxDate) {
      const dateString = currentDate.toISOString().split('T')[0]
      result.push({ date: dateString, count: dateMap.get(dateString) || 0 })

      currentDate.setDate(currentDate.getDate() + 1)
    }

    return result
  }

  const getStats = async () => {
    try {
      const { data } = await DASHBOARD()
      for (const key of Object.keys(gridStats.value)) {
        gridStats.value[key].count = data[key]
      }
      orderStats.value = fillMissingDates(data.order_statistic)
    } catch (error) {
      console.error(error)
    }
  }

  getStats()
  const interval = ref(null)
  interval.value = setInterval(() => {
    getStats()
  }, 3000)

  onUnmounted(() => {
    clearInterval(interval.value)
  })
</script>

<template>
  <div class="stats">
    <div class="stats__wrapper">
      <div class="stats__orders">
        <line-chart :dataset="orderStats" />
      </div>
      <div class="stats__counts">
        <div
          v-for="countItem in gridStats"
          :class="[
            'stats__count-box',
            {
              'stats__count-box_double': countItem.double
            }
          ]"
        >
          <div class="stats__count-number">{{ countItem.count }}</div>
          <div class="stats__count-title">{{ t(countItem.title) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .stats {
    height: 100%;
    overflow: auto;
    // .stats__wrapper
    &__wrapper {
    }
    // .stats__orders
    &__orders {
      border-radius: 10px;
      background-color: var(--white);
      padding: 20px;
      height: 400px;
    }
    // .stats__counts
    &__counts {
      display: grid;
      grid-gap: 20px;
      grid-template-columns: repeat(4, 1fr);
      margin-top: 20px;
    }
    // .stats__count-box
    &__count-box {
      border-radius: 10px;
      background-color: var(--white);
      padding: 20px;
      text-align: center;
      &_double {
        grid-column-start: span 2;
      }
    }
    // .stats__count-number
    &__count-number {
      font-size: 50px;
      font-weight: 500;
      color: var(--gray-800);
    }
    // .stats__count-title
    &__count-title {
      font-size: 16px;
      margin-top: 10px;
    }
  }
</style>

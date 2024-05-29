<template>
  <LineChart :chart-data="data" :options="options" css-classes="chart-container" ref="lineChart" />
</template>

<script setup>
  import { ref, computed, watchEffect } from 'vue'
  import { LineChart } from 'vue-chart-3'
  import { Chart, LinearScale, LineElement, LineController, CategoryScale, PointElement } from 'chart.js'

  const props = defineProps({
    dataset: { type: Array, default: () => [] }
  })

  Chart.register(LinearScale, LineElement, LineController, CategoryScale, PointElement)

  const labels = ref([])
  const dataset = ref([])

  const data = computed(() => ({
    labels: labels.value,

    datasets: [
      {
        label: '',
        data: dataset.value,
        borderColor: '#0077E4',
        tension: 0
      }
    ]
  }))

  const options = ref({
    responsive: true,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      x: {
        grid: {
          color: 'transparent',
          borderColor: 'transparent',
          tickColor: 'transparent'
        }
      },
      y: {
        stacked: true,
        grid: {
          borderColor: 'transparent',
          tickColor: 'transparent'
        }
      }
    }
  })

  watchEffect(() => {
    const newDataset = []
    const newLabels = []
    props.dataset?.forEach((item) => {
      newLabels.push(`${item.date.split('-')[2]}.${item.date.split('-')[1]}`)
      newDataset.push(item.count || 0)
    })
    labels.value = newLabels
    dataset.value = newDataset
  })
</script>

<style scoped>
  .chart-container {
    height: 100%;
  }
</style>

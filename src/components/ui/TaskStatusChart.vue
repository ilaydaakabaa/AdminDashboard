<template>
  <div class="content-card task-chart-card">
    <div class="card-header task-chart-header">
      <h2>Görev Durumu</h2>
      <span>Canlı dağılım</span>
    </div>

    <div ref="chartRef" class="task-chart" aria-label="Görev durum grafiği"></div>
  </div>
</template>

<script setup>
import * as echarts from 'echarts'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  productBacklog: {
    type: Number,
    default: 0
  },
  sprintBacklog: {
    type: Number,
    default: 0
  },
  test: {
    type: Number,
    default: 0
  },
  done: {
    type: Number,
    default: 0
  }
})

const chartRef = ref(null)
let chartInstance = null

function getChartOptions() {
  const total =
    props.productBacklog +
    props.sprintBacklog +
    props.test +
    props.done

  const hasData = total > 0

  return {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      bottom: 0,
      icon: 'circle'
    },
    series: [
      {
        name: 'Görevler',
        type: 'pie',
        radius: ['48%', '72%'],
        center: ['50%', '46%'],
        avoidLabelOverlap: true,
        label: {
          show: true,
          formatter: hasData ? '{b}\n{d}%' : '{b}',
          fontWeight: 700
        },
        labelLine: {
          show: hasData
        },
        data: hasData
          ? [
              {
                value: props.productBacklog,
                name: 'Product Backlog',
                itemStyle: {
                  color: '#16a34a'
                }
              },
              {
                value: props.sprintBacklog,
                name: 'Sprint Backlog',
                itemStyle: {
                  color: '#f59e0b'
                }
              },
              {
                value: props.test,
                name: 'Test',
                itemStyle: {
                  color: '#3b82f6'
                }
              },
              {
                value: props.done,
                name: 'Tamamlandı',
                itemStyle: {
                  color: '#10b981'
                }
              }
            ]
          : [
              {
                value: 1,
                name: 'Görev Yok',
                itemStyle: {
                  color: '#cbd5e1'
                }
              }
            ]
      }
    ]
  }
}

function renderChart() {
  if (!chartRef.value) {
    return
  }

  if (!chartInstance) {
    chartInstance = echarts.init(chartRef.value)
  }

  chartInstance.setOption(getChartOptions(), true)
}

function handleResize() {
  if (chartInstance) {
    chartInstance.resize()
  }
}

onMounted(() => {
  renderChart()
  window.addEventListener('resize', handleResize)
})

watch(
  () => [props.productBacklog, props.sprintBacklog, props.test, props.done],
  () => {
    renderChart()
  }
)

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)

  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
})
</script>

<style scoped>
.task-chart-card {
  min-height: 380px;
}

.task-chart-header span {
  color: #6b7280;
  font-size: 0.9rem;
  font-weight: 600;
}

.task-chart {
  width: 100%;
  height: 280px;
}
</style>
<template>
  <div class="content-card task-chart-card">
    <div class="card-header task-chart-header">
      <h2>Atadığım ve Biten Görevler</h2>
      <span>Verilen Görevler içindeki Tamamlanma Durumu</span>
      <!-- <p class="quick-stats">
        Atadığım: <strong>{{ props.assigned }}</strong> | Biten:
        <strong>{{ props.completedAssigned }}</strong>
      </p> -->
    </div>

    <div ref="chartRef" class="task-chart" aria-label="Atanan ve biten görev grafiği"></div>
  </div>
</template>

<script setup>
import * as echarts from 'echarts'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  assigned: {
    type: Number,
    default: 0
  },
  completedAssigned: {
    type: Number,
    default: 0
  }
})

const chartRef = ref(null)
let chartInstance = null

function getChartOptions() {
  const hasData = props.assigned > 0 || props.completedAssigned > 0
  const maxValue = Math.max(props.assigned, props.completedAssigned)

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      top: 28,
      left: 10,
      right: 10,
      bottom: 8,
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['Atadığım', 'Biten'],
      axisTick: {
        show: false // çeltik kaldırıyor
      }
    },
    yAxis: {
      type: 'value',
      min: 0,
      minInterval: 1,
      max: maxValue === 0 ? 1 : maxValue + 1
    },
    series: [
      {
        type: 'bar',
        barWidth: 44,
        data: hasData
          ? [
              {
                value: props.assigned,
                itemStyle: { color: '#2563eb' }
              },
              {
                value: props.completedAssigned,
                itemStyle: { color: '#16a34a' }
              }
            ]
          : [
              {
                value: 0,
                itemStyle: { color: '#cbd5e1' }
              },
              {
                value: 0,
                itemStyle: { color: '#cbd5e1' }
              }
            ],
        label: {
          show: true,
          position: 'top',
          distance: 10,
          formatter: '{c}',
          fontWeight: 700
        },
        itemStyle: {
          borderRadius: [8, 8, 0, 0]
        },
        clip: false
      }
    ]
  }
}

function renderChart() {
  if (!chartRef.value) {
    return  //ref henüz DOM'a bağlanmamışsa işlemi iptal ediyoruz
  }

  if (!chartInstance) { 
    chartInstance = echarts.init(chartRef.value) //ECharts grafiği oluşturuyor.
  }

  chartInstance.setOption(getChartOptions(), true) // veriyi ekle grafiğe yAxis xAxis series gibi bilgileri ekliyoruz. true parametresi ile grafiği güncelliyoruz.
}

function handleResize() {
  if (chartInstance) {
    chartInstance.resize() // grafiği ueniden boyutlandır responsive için
  }
}

onMounted(() => {
  renderChart()
  window.addEventListener('resize', handleResize)
})

watch(
  () => [props.assigned, props.completedAssigned],
  () => {
    renderChart()
  }
)

onBeforeUnmount(() => { // component kaldırılmadan önce yapılacak işlemler
  window.removeEventListener('resize', handleResize)

  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
})
</script>

<style scoped>
.task-chart-card {
  min-height: 320px;
}

.task-chart-header span {
  color: #6b7280;
  font-size: 0.9rem;
  font-weight: 600;
}

.quick-stats {
  margin: 6px 0 0;
  color: #334155;
  font-size: 0.92rem;
}

.task-chart {
  width: 100%;
  height: 220px;
}

</style>
<template>
  <section class="dashboard-page">
    <div class="dashboard-header">
      <div>
        <h1>Dashboard</h1>
        <p v-if="email">Tekrar hoş geldin, {{ welcomeName}}</p>
      </div>

      <router-link to="/tasks/new" class="add-task-btn">
        + Yeni Görev
      </router-link>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <h3>Toplam Görev</h3>
        <p>{{ totalTasks }}</p>
      </div>

      <div class="stat-card">
        <h3>Tamamlanan</h3>
        <p>{{ completedTasks.length }}</p>
      </div>

      <div class="stat-card">
        <h3>Bekleyen</h3>
        <p>{{ pendingTasks.length }}</p>
      </div>
    </div>

    <div class="dashboard-content">
      <div class="content-card">
        <div class="card-header">
          <h2>Son Görevler</h2>
          <router-link to="/tasks">Tümünü Gör</router-link>
        </div>

        <div v-if="tasks.length === 0" class="empty-state">
          Henüz görev eklenmemiş.
        </div>

        <ul v-else class="recent-task-list">
          <li v-for="task in limitedTasks" :key="task.id" class="recent-task-item">
            <div>
              <h4>{{ task.title }}</h4>
              <p>{{ task.description }}</p>
            </div>

            <div class="task-actions">
              <span
                class="status-badge"
                :class="task.status === 'completed' ? 'completed' : 'pending'"
              >
                {{ task.status === 'completed' ? 'Tamamlandı' : 'Bekliyor' }}
              </span>

              <button
                class="delete-btn"
                type="button"
                :disabled="deletingTaskIds.includes(task.id)"
                aria-label="Gorevi sil"
                @click="removeTaskById(task.id)"
              >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M9 3h6m-9 4h12m-1 0-.84 12.15a2 2 0 0 1-2 1.85h-4.32a2 2 0 0 1-2-1.85L6 7m4 4v6m4-6v6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

const email = computed(() => store.getters['auth/email'])
const token = computed(() => store.getters['auth/token'])
const userId = computed(() => store.getters['auth/userId'])

const tasks = computed(() => store.getters['tasks/tasks'])
const totalTasks = computed(() => store.getters['tasks/totalTasks'])
const completedTasks = computed(() => store.getters['tasks/completedTasks'])
const pendingTasks = computed(() => store.getters['tasks/pendingTasks'])
const deletingTaskIds = ref([])

const limitedTasks = computed(() => tasks.value.slice(0, 5))

async function removeTaskById(taskId) {
  if (deletingTaskIds.value.includes(taskId)) {
    return
  }

  deletingTaskIds.value.push(taskId)

  try {
    await store.dispatch('tasks/removeTask', {
      token: token.value,
      userId: userId.value,
      taskId
    })
  } catch (error) {
    console.error(error)
  } finally {
    deletingTaskIds.value = deletingTaskIds.value.filter(id => id !== taskId)
  }
}


const welcomeName = computed(() => {
  if (!email.value) return ''

  const namePart = email.value.split('@')[0]
  return namePart.charAt(0).toUpperCase() + namePart.slice(1)
})  

onMounted(() => {
  store.dispatch('tasks/fetchTasks', {
    token: token.value,
    userId: userId.value
  })
})
</script>

<style scoped>
.dashboard-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 16px 48px;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 28px;
  flex-wrap: wrap;
}

.dashboard-header h1 {
  margin: 0 0 8px;
  font-size: 2rem;
  color: #111827;
}

.dashboard-header p {
  margin: 0;
  color: #6b7280;
}

.add-task-btn {
  text-decoration: none;
  background: #2563eb;
  color: white;
  padding: 12px 16px;
  border-radius: 12px;
  font-weight: 700;
  transition: 0.25s ease;
}

.add-task-btn:hover {
  background: #1d4ed8;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
  margin-bottom: 28px;
}

.stat-card {
  background: white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 15px 40px rgba(15, 23, 42, 0.08);
}

.stat-card h3 {
  margin: 0 0 14px;
  color: #6b7280;
  font-size: 1rem;
  font-weight: 600;
}

.stat-card p {
  margin: 0;
  font-size: 2rem;
  font-weight: 800;
  color: #111827;
}

.dashboard-content {
  display: grid;
  grid-template-columns: 1fr;
}

.content-card {
  background: white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 15px 40px rgba(15, 23, 42, 0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
  flex-wrap: wrap;
}

.card-header h2 {
  margin: 0;
  font-size: 1.3rem;
  color: #111827;
}

.card-header a {
  color: #2563eb;
  text-decoration: none;
  font-weight: 700;
}

.recent-task-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.recent-task-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 14px;
  padding: 16px;
  border-radius: 16px;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
}

.recent-task-item h4 {
  margin: 0 0 6px;
  color: #111827;
}

.recent-task-item p {
  margin: 0;
  color: #6b7280;
  line-height: 1.5;
}

.task-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.status-badge {
  white-space: nowrap;
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 0.9rem;
  font-weight: 700;
}

.status-badge.completed {
  background: #dcfce7;
  color: #166534;
}

.status-badge.pending {
  background: #fef3c7;
  color: #92400e;
}

.delete-btn {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: 1px solid #fecaca;
  color: #dc2626;
  background: #fff1f2;
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.2s ease, border-color 0.2s ease;
}

.delete-btn svg {
  width: 17px;
  height: 17px;
}

.delete-btn:hover {
  background: #ffe4e6;
  border-color: #fda4af;
  transform: translateY(-1px);
}

.delete-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.empty-state {
  padding: 18px;
  border-radius: 14px;
  background: #f9fafb;
  color: #6b7280;
  border: 1px dashed #d1d5db;
}

@media (max-width: 900px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .dashboard-header h1 {
    font-size: 1.7rem;
  }

  .recent-task-item {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
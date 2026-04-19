<template>
  <section class="dashboard-page">
    <div class="dashboard-header">
      <div>
        <h1>Dashboard</h1>
        <p v-if="email">Tekrar hoş geldin, {{ welcomeName }}</p>
      </div>

      <div class="header-actions">
        <router-link to="/" class="board-btn">
          Board'a Git
        </router-link>

        <button class="add-task-btn" type="button" @click="openQuickTaskModal">
          + Yeni Görev
        </button>
      </div>
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
        <h3>Devam Eden</h3>
        <p>{{ pendingTasks.length }}</p>
      </div>
    </div>

    <div class="dashboard-content">
      <div class="charts-grid">
        <TaskStatusChart :product-backlog="productBacklogTasks.length" :sprint-backlog="sprintBacklogTasks.length"
          :test="testTasks.length" :done="doneTasks.length" />

        <AssignedCompletedChart :gorevler="assignedByMeTasks.length" :done="completedAssignedByMeTasks" />

        <MyAssignmentStatusChart :product-backlog="assignedToMeProductBacklogTasks.length"
          :sprint-backlog="assignedToMeSprintBacklogTasks.length" :test="assignedToMeTestTasks.length"
          :done="assignedToMeDoneTasks.length" />
      </div>

      <div class="content-card">
        <div class="card-header">
          <h2>Son Görevler</h2>
          <router-link to="/home">Board'u Gör</router-link>
        </div>

        <div v-if="tasks.length === 0" class="empty-state">
          Henüz görev eklenmemiş.
        </div>

        <ul v-else class="recent-task-list">
          <li v-for="task in limitedTasks" :key="task.id" class="recent-task-item">
            <div class="task-main">
              <h4>{{ task.title }}</h4>
              <p>{{ task.description || 'Açıklama yok.' }}</p>

              <div class="task-meta">
                <TaskMetaChip :variant="task.status">
                  {{ getColumnTitle(task.status) }}
                </TaskMetaChip>

                <TaskMetaChip v-if="task.assignedUserEmail" variant="default">
                  Atanan: {{ task.assignedUserEmail }}
                </TaskMetaChip>

                <TaskMetaChip v-if="task.deadline" variant="default">
                  Bitiş: {{ task.deadline }}
                </TaskMetaChip>
              </div>
            </div>

            <div class="task-actions">
              <!-- <span class="status-badge" :class="task.status === 'done' ? 'completed' : 'pending'">
                {{ task.status === 'done' ? 'Tamamlandı' : getColumnTitle(task.status) }}
              </span> -->

              <button class="delete-btn" type="button" :disabled="deletingTaskIds.includes(task.id)"
                aria-label="Görevi sil" @click="removeTaskById(task.id, task.ownerUserId)">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M9 3h6m-9 4h12m-1 0-.84 12.15a2 2 0 0 1-2 1.85h-4.32a2 2 0 0 1-2-1.85L6 7m4 4v6m4-6v6"
                    stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>
            </div>
          </li>
        </ul>
      </div>
    </div>

    <div v-if="showQuickTaskModal" class="modal-overlay" @click.self="closeQuickTaskModal">
      <div class="task-modal">
        <div class="modal-header">
          <h2>Hızlı Görev Ekle</h2>
          <button class="close-btn" type="button" @click="closeQuickTaskModal">
            Kapat
          </button>
        </div>

        <div class="modal-form">
          <div class="form-group">
            <label>Başlık</label>
            <input v-model="quickTask.title" type="text" placeholder="Görev başlığı" />
          </div>

          <div class="form-group">
            <label>Açıklama</label>
            <textarea v-model="quickTask.description" rows="4" placeholder="Görev açıklaması" />
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label>Sütun</label>
              <select v-model="quickTask.status">
                <option v-for="column in columns" :key="column.id" :value="column.id">
                  {{ column.title }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label>Kişiye Ata</label>
              <select v-model="quickTask.assignedUserId">
                <option value="">Kişi seç</option>
                <option v-for="user in users" :key="user.id" :value="user.id">
                  {{ user.email }}
                </option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Bitiş Tarihi</label>
            <input v-model="quickTask.deadline" type="date" />
          </div>

          <div class="modal-actions">
            <button class="secondary-btn" type="button" @click="closeQuickTaskModal">
              Vazgeç
            </button>
            <button class="primary-btn" type="button" @click="createQuickTask">
              Kaydet
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useStore } from 'vuex'
import TaskStatusChart from '@/components/ui/TaskStatusChart.vue'
import AssignedCompletedChart from '@/components/ui/AssignedCompletedChart.vue'
import MyAssignmentStatusChart from '@/components/ui/MyAssignmentStatusChart.vue'
import TaskMetaChip from '@/components/ui/TaskMetaChip.vue'

const store = useStore()

const email = computed(() => store.getters['auth/email'])
const token = computed(() => store.getters['auth/token'])
const userId = computed(() => store.getters['auth/userId'])

const tasks = computed(() => store.getters['tasks/tasks'] || [])
const totalTasks = computed(() => store.getters['tasks/totalTasks'] || 0)
const completedTasks = computed(() => store.getters['tasks/completedTasks'] || [])
const pendingTasks = computed(() => store.getters['tasks/pendingTasks'] || [])
const users = computed(() => store.getters['tasks/users'] || [])
const columns = computed(() => store.getters['tasks/columns'] || [])
const productBacklogTasks = computed(() => store.getters['tasks/productBacklogTasks'] || [])
const sprintBacklogTasks = computed(() => store.getters['tasks/sprintBacklogTasks'] || [])
const testTasks = computed(() => store.getters['tasks/testTasks'] || [])
const doneTasks = computed(() => store.getters['tasks/doneTasks'] || [])
const deletingTaskIds = ref([])
const showQuickTaskModal = ref(false)

const quickTask = ref({
  title: '',
  description: '',
  status: 'product-backlog',
  assignedUserId: '',
  deadline: ''
})

const assignedByMeTasks = computed(() => {
  return tasks.value.filter(task => task.assignedById === userId.value)
})

const completedAssignedByMeTasks = computed(() => {
  return assignedByMeTasks.value.filter(task => task.status === 'done').length
})

const limitedTasks = computed(() => {
  return [...tasks.value]
    .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))
    .slice(0, 5)
})

const welcomeName = computed(() => {
  if (!email.value) return ''
  const namePart = email.value.split('@')[0]
  return namePart.charAt(0).toUpperCase() + namePart.slice(1)
})
const assignedToMeTasks = computed(() => {
  return tasks.value.filter(task => task.assignedUserId === userId.value)
})

const assignedToMeProductBacklogTasks = computed(() => {
  return assignedToMeTasks.value.filter(task => task.status === 'product-backlog')
})

const assignedToMeSprintBacklogTasks = computed(() => {
  return assignedToMeTasks.value.filter(task => task.status === 'sprint-backlog')
})

const assignedToMeTestTasks = computed(() => {
  return assignedToMeTasks.value.filter(task => task.status === 'test')
})

const assignedToMeDoneTasks = computed(() => {
  return assignedToMeTasks.value.filter(task => task.status === 'done')
})
function getColumnTitle(columnId) {
  const foundColumn = columns.value.find(column => column.id === columnId)
  return foundColumn ? foundColumn.title : columnId
}

function openQuickTaskModal() {
  quickTask.value = {
    title: '',
    description: '',
    status: columns.value[0]?.id || 'product-backlog',
    assignedUserId: '',
    deadline: ''
  }
  showQuickTaskModal.value = true
}

function closeQuickTaskModal() {
  showQuickTaskModal.value = false
}

async function createQuickTask() {
  if (!quickTask.value.title.trim()) return

  const selectedUser = users.value.find(
    user => user.id === quickTask.value.assignedUserId
  )

  try {
    await store.dispatch('tasks/addTask', {
      title: quickTask.value.title,
      description: quickTask.value.description,
      status: quickTask.value.status || 'product-backlog',
      assignedUserId: quickTask.value.assignedUserId || '',
      assignedUserEmail: selectedUser?.email || '',
      assignedById: userId.value,
      assignedByEmail: email.value,
      deadline: quickTask.value.deadline || '',
      userId: userId.value,
      token: token.value,
      order: Date.now()
    })

    closeQuickTaskModal()
  } catch (error) {
    console.error(error)
  }
}

async function removeTaskById(taskId, ownerUserId) {
  if (deletingTaskIds.value.includes(taskId)) {
    return
  }

  deletingTaskIds.value.push(taskId)

  try {
    await store.dispatch('tasks/deleteTask', {
      token: token.value,
      userId: userId.value,
      taskId,
      ownerUserId
    })
  } catch (error) {
    console.error(error)
  } finally {
    deletingTaskIds.value = deletingTaskIds.value.filter(id => id !== taskId)
  }
}



onMounted(async () => {
  await store.dispatch('tasks/fetchColumns', {
    token: token.value,
    userId: userId.value
  })

  await store.dispatch('tasks/fetchVisibleTasks', {
    token: token.value,
    userId: userId.value
  })

  await store.dispatch('tasks/fetchUsers', {
    token: token.value
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

.header-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.add-task-btn,
.board-btn {
  text-decoration: none;
  background: #2563eb;
  color: white;
  padding: 12px 16px;
  border-radius: 12px;
  font-weight: 700;
  transition: 0.25s ease;
  white-space: nowrap;
  border: none;
  cursor: pointer;
}

.board-btn {
  background: #111827;
}

.add-task-btn:hover {
  background: #1d4ed8;
}

.board-btn:hover {
  background: #1f2937;
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
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
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

.task-main {
  flex: 1;
}

.recent-task-item h4 {
  margin: 0 0 6px;
  color: #111827;
  word-break: break-word;
}

.recent-task-item p {
  margin: 0 0 12px;
  color: #6b7280;
  line-height: 1.5;
  word-break: break-word;
}

.task-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.meta-chip {
  padding: 7px 10px;
  background: #eef2ff;
  color: #3730a3;
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 600;
}

.task-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  flex-wrap: wrap;
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
  flex-shrink: 0;
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

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  z-index: 999;
}

.task-modal {
  width: 100%;
  max-width: 640px;
  background: white;
  border-radius: 22px;
  padding: 20px;
  box-sizing: border-box;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
}

.modal-header h2 {
  margin: 0;
}

.close-btn,
.primary-btn,
.secondary-btn {
  border: none;
  border-radius: 12px;
  padding: 11px 16px;
  font: inherit;
  cursor: pointer;
}

.close-btn,
.secondary-btn {
  background: #e5e7eb;
  color: #111827;
}

.primary-btn {
  background: #2563eb;
  color: #fff;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  color: #374151;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #d1d5db;
  border-radius: 14px;
  font: inherit;
  box-sizing: border-box;
  background: #fff;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 8px;
  flex-wrap: wrap;
}

@media (max-width: 980px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 900px) {
  .dashboard-page {
    padding: 28px 14px 40px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .stat-card,
  .content-card {
    padding: 20px;
  }
}

@media (max-width: 640px) {
  .dashboard-page {
    padding: 22px 12px 32px;
  }

  .dashboard-header {
    align-items: stretch;
  }

  .dashboard-header h1 {
    font-size: 1.7rem;
  }

  .header-actions {
    width: 100%;
    flex-direction: column;
  }

  .add-task-btn,
  .board-btn {
    width: 100%;
    text-align: center;
  }

  .card-header {
    align-items: flex-start;
  }

  .recent-task-item {
    flex-direction: column;
    align-items: stretch;
  }

  .task-actions {
    justify-content: space-between;
    width: 100%;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .modal-actions {
    flex-direction: column;
  }

  .modal-actions button {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .dashboard-page {
    padding: 18px 10px 28px;
  }

  .dashboard-header h1 {
    font-size: 1.5rem;
  }

  .stat-card,
  .content-card,
  .task-modal {
    padding: 16px;
    border-radius: 16px;
  }

  .stat-card p {
    font-size: 1.7rem;
  }

  .card-header h2 {
    font-size: 1.1rem;
  }

  .recent-task-item {
    padding: 14px;
  }

  .status-badge {
    font-size: 0.82rem;
    padding: 7px 10px;
  }

  .delete-btn {
    width: 32px;
    height: 32px;
  }
}
</style>
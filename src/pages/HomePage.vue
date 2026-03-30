<script setup>
import { computed, onMounted, ref } from 'vue'
import { useStore } from 'vuex'
import draggable from 'vuedraggable'

const store = useStore()

const loading = ref(false)
const error = ref('')
const newColumnTitle = ref('')
const showTaskModal = ref(false)
const currentColumnId = ref('product-backlog')

const form = ref({
  title: '',
  description: '',
  assignedUserId: '',
  deadline: ''
})

const userId = computed(() => store.getters['auth/userId'])
const token = computed(() => store.getters['auth/token'])
const email = computed(() => store.getters['auth/email'])

const columns = computed(() => store.getters['tasks/columns'] || [])
const tasks = computed(() => store.getters['tasks/tasks'] || [])
const users = computed(() => store.getters['tasks/users'] || [])

const boardColumns = computed(() => {
  return columns.value.map(column => ({
    ...column,
    tasks: tasks.value
      .filter(task => task.status === column.id)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  }))
})

function getUserEmailById(id) {
  const foundUser = users.value.find(user => user.id === id)
  return foundUser?.email || ''
}

async function loadData() {
  loading.value = true
  error.value = ''

  try {
    await store.dispatch('tasks/fetchColumns', {
      userId: userId.value,
      token: token.value
    })

    await store.dispatch('tasks/fetchTasks', {
      userId: userId.value,
      token: token.value
    })

    await store.dispatch('tasks/fetchUsers', {
      token: token.value
    })
  } catch (err) {
    error.value = err.message || 'Veriler yüklenemedi.'
  } finally {
    loading.value = false
  }
}

function openTaskModal(columnId) {
  currentColumnId.value = columnId
  form.value = {
    title: '',
    description: '',
    assignedUserId: '',
    deadline: ''
  }
  showTaskModal.value = true
}

function closeTaskModal() {
  showTaskModal.value = false
}

async function addColumn() {
  const title = newColumnTitle.value.trim()
  if (!title) return

  const columnId = title.toLowerCase().trim().replace(/\s+/g, '-')

  try {
    await store.dispatch('tasks/addColumn', {
      id: columnId,
      title,
      order: columns.value.length + 1,
      userId: userId.value,
      token: token.value
    })

    newColumnTitle.value = ''
  } catch (err) {
    error.value = err.message || 'Sütun eklenemedi.'
  }
}

async function createTask() {
  if (!form.value.title.trim()) {
    error.value = 'Görev başlığı zorunlu.'
    return
  }

  const selectedUser = users.value.find(
    user => user.id === form.value.assignedUserId
  )

  try {
    await store.dispatch('tasks/addTask', {
      title: form.value.title,
      description: form.value.description,
      status: currentColumnId.value,
      assignedUserId: form.value.assignedUserId || '',
      assignedUserEmail: selectedUser?.email || '',
      assignedById: userId.value,
      assignedByEmail: email.value,
      deadline: form.value.deadline,
      userId: userId.value,
      token: token.value,
      order: Date.now()
    })

    closeTaskModal()
  } catch (err) {
    error.value = err.message || 'Görev oluşturulamadı.'
  }
}

async function onTaskMoved(event, columnId) {
  const movedItem = event?.added?.element
  if (!movedItem) return

  try {
    await store.dispatch('tasks/editTask', {
      ...movedItem,
      status: columnId,
      userId: userId.value,
      token: token.value,
      order: Date.now()
    })
  } catch (err) {
    error.value = err.message || 'Görev taşınamadı.'
    await loadData()
  }
}

async function deleteColumn(columnId) {
  try {
    await store.dispatch('tasks/deleteColumn', {
      columnId,
      userId: userId.value,
      token: token.value
    })
  } catch (err) {
    error.value = err.message || 'Sütun silinemedi.'
  }
}

async function updateTaskAssignee(task, selectedUserId) {
  const selectedUser = users.value.find(user => user.id === selectedUserId)

  try {
    await store.dispatch('tasks/editTask', {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      assignedUserId: selectedUserId || '',
      assignedUserEmail: selectedUser?.email || '',
      assignedById: task.assignedById,
      assignedByEmail: task.assignedByEmail,
      deadline: task.deadline || '',
      order: task.order ?? Date.now(),
      userId: userId.value,
      token: token.value
    })
  } catch (err) {
    error.value = err.message || 'Atanan kişi güncellenemedi.'
    await loadData()
  }
}
async function updateTaskDeadline(task, newDeadline) {
  try {
    await store.dispatch('tasks/updateTaskDeadline', {
      id: task.id,
      deadline: newDeadline,
      userId: userId.value,
      token: token.value
    })
  } catch (err) {
    error.value = err.message || 'Deadline güncellenemedi.'
  }
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <section class="board-page">
    <div class="page-top">
      <div>
        <h1>Kanban Board</h1>
        <p>Görevleri kart olarak yönetebilir, kişilere atayabilir ve sürükleyip bırakabilirsin.</p>
      </div>

      <div class="column-create">
        <input v-model="newColumnTitle" type="text" placeholder="Yeni sütun adı" @keyup.enter="addColumn" />
        <button @click="addColumn">Sütun Ekle</button>
      </div>
    </div>

    <div v-if="error" class="message error">{{ error }}</div>
    <div v-if="loading" class="message info">Yükleniyor...</div>

    <div v-else class="board-wrapper">
      <div class="board-columns">
        <section v-for="column in boardColumns" :key="column.id" class="column">
          <header class="column-head">
            <div class="column-title-box">
              <h2>{{ column.title }}</h2>
              <span>{{ column.tasks.length }} görev</span>
            </div>

            <button class="danger-btn" @click="deleteColumn(column.id)">
              Sil
            </button>
          </header>

          <div class="column-divider"></div>

          <button class="add-task" @click="openTaskModal(column.id)">
            + Bu Alana Görev Ekle
          </button>

          <draggable :list="column.tasks" group="tasks" item-key="id" class="task-list" ghost-class="ghost-card"
            chosen-class="chosen-card" drag-class="drag-card" @change="onTaskMoved($event, column.id)">
            <template #item="{ element }">
              <article class="task-card">
                <div class="task-card-top">
                  <h3>{{ element.title }}</h3>
                  <span class="task-pill">
                    {{ column.title }}
                  </span>
                </div>

                <p v-if="element.description" class="desc">
                  {{ element.description }}
                </p>

                <div class="task-info-grid">
                  <div class="info-box">
                    <small>Atanan Kişi</small>
                    <select class="assignee-select" :value="element.assignedUserId || ''"
                      @change="updateTaskAssignee(element, $event.target.value)">
                      <option value="">Kişi seç</option>
                      <option v-for="user in users" :key="user.id" :value="user.id">
                        {{ user.email }}
                      </option>
                    </select>
                  </div>

                  <div class="info-box" >
                    <small>Bitiş Tarihi</small>
                    <input type="date" class="deadline-input" :value="element.deadline || ''"
                      @change="updateTaskDeadline(element, $event.target.value)" />
                  </div>
                </div>
              </article>
            </template>
          </draggable>
        </section>
      </div>
    </div>

    <div v-if="showTaskModal" class="modal-overlay" @click.self="closeTaskModal">
      <div class="modal">
        <div class="modal-top">
          <h2>Yeni Görev</h2>
          <button @click="closeTaskModal">Kapat</button>
        </div>

        <div class="form-group">
          <label>Başlık</label>
          <input v-model="form.title" type="text" placeholder="Görev başlığı" />
        </div>

        <div class="form-group">
          <label>Açıklama</label>
          <textarea v-model="form.description" rows="4" placeholder="Görev açıklaması"></textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Kişiye Ata</label>
            <select v-model="form.assignedUserId" class="assignee-select">
              <option value="">Kişi seç</option>
              <option v-for="user in users" :key="user.id" :value="user.id">
                {{ user.email }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Bitiş Tarihi</label>
            <input v-model="form.deadline" type="date" />
          </div>
        </div>

        <div class="modal-actions">
          <button class="secondary" @click="closeTaskModal">Vazgeç</button>
          <button class="primary" @click="createTask">Kaydet</button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.board-page {
  max-width: 1500px;
  margin: 0 auto;
  padding: 24px 16px 40px;
}

.page-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 22px;
}

.page-top h1 {
  margin: 0 0 8px;
  font-size: 2rem;
  color: #111827;
}

.page-top p {
  margin: 0;
  color: #6b7280;
  line-height: 1.5;
}

.column-create {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  width: 100%;
  max-width: 430px;
}

.column-create input,
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

.column-create button,
.add-task,
.primary,
.secondary,
.danger-btn,
.modal-top button {
  border: none;
  border-radius: 12px;
  padding: 11px 16px;
  font: inherit;
  cursor: pointer;
}

.column-create button,
.primary {
  background: #2563eb;
  color: #fff;
}

.secondary,
.modal-top button {
  background: #e5e7eb;
  color: #111827;
}

.danger-btn {
  background: #fee2e2;
  color: #b91c1c;
  white-space: nowrap;
}

.add-task {
  width: 100%;
  margin-bottom: 14px;
  background: #eff6ff;
  color: #1d4ed8;
  font-weight: 600;
}

.message {
  padding: 14px 16px;
  border-radius: 14px;
  margin-bottom: 18px;
}

.message.error {
  background: #fef2f2;
  color: #b91c1c;
}

.message.info {
  background: #eff6ff;
  color: #1d4ed8;
}

.board-wrapper {
  overflow-x: auto;
  padding-bottom: 10px;
}

.board-columns {
  display: flex;
  gap: 18px;
  min-width: max-content;
  align-items: flex-start;
}

.column {
  width: 340px;
  min-width: 340px;
  background: #f8fafc;
  border: 1px solid #dbe3ee;
  border-radius: 22px;
  padding: 16px;
  box-sizing: border-box;
}

.column-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
}

.column-title-box h2 {
  margin: 0 0 6px;
  font-size: 1.08rem;
  color: #111827;
}

.column-title-box span {
  color: #6b7280;
  font-size: 0.9rem;
}

.column-divider {
  width: 100%;
  border-top: 2px dashed #cbd5e1;
  margin: 14px 0 14px;
}

.task-list {
  min-height: 200px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 6px;
  border: 2px dashed #dbe3ee;
  border-radius: 16px;
  background: #fdfefe;
}

.task-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  padding: 14px;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.06);
}

.task-card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 10px;
}

.task-card h3 {
  margin: 0;
  font-size: 1rem;
  color: #111827;
  line-height: 1.4;
}

.task-pill {
  white-space: nowrap;
  padding: 6px 10px;
  border-radius: 999px;
  background: #eef2ff;
  color: #3730a3;
  font-size: 0.74rem;
  font-weight: 700;
}

.desc {
  margin: 0 0 14px;
  color: #4b5563;
  line-height: 1.5;
}

.task-info-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

.info-box {
  padding: 10px 12px;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
}

.info-box small {
  display: block;
  color: #6b7280;
  margin-bottom: 4px;
}

.info-box strong {
  color: #111827;
  word-break: break-word;
}

.ghost-card {
  opacity: 0.45;
}

.chosen-card {
  transform: rotate(1deg);
}

.drag-card {
  cursor: grabbing;
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

.modal {
  width: 100%;
  max-width: 640px;
  background: white;
  border-radius: 22px;
  padding: 20px;
  box-sizing: border-box;
}

.modal-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
}

.modal-top h2 {
  margin: 0;
}

.form-group {
  margin-bottom: 14px;
}

.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  color: #374151;
}

.form-row {
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

@media (max-width: 900px) {
  .column {
    width: 300px;
    min-width: 300px;
  }
}

@media (max-width: 768px) {
  .page-top {
    flex-direction: column;
    align-items: stretch;
  }

  .column-create {
    max-width: 100%;
    flex-direction: column;
  }

  .form-row {
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
  .board-page {
    padding: 18px 10px 28px;
  }

  .page-top h1 {
    font-size: 1.5rem;
  }

  .column {
    width: 86vw;
    min-width: 86vw;
    padding: 14px;
  }

  .column-head {
    flex-direction: column;
    align-items: stretch;
  }

  .task-card-top {
    flex-direction: column;
  }

  .task-list {
    min-height: 140px;
  }
}

.assignee-select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  background: #fff;
  font: inherit;
  color: #111827;
  outline: none;
}

.assignee-select:focus {
  border-color: #2563eb;
}

.deadline-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  background: #fff;
  font: inherit;
  color: #111827;
  outline: none;
}

.deadline-input:focus {
  border-color: #2563eb;
}
</style>
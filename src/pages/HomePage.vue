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

    await store.dispatch('tasks/fetchVisibleTasks', {
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
  token: token.value,
  ownerUserId: task.ownerUserId
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
      token: token.value,
      ownerUserId: task.ownerUserId
    })
  } catch (err) {
    error.value = err.message || 'Deadline güncellenemedi.'
  }
}
function getStatusLabel(status) {
  switch (status) {
    case 'product-backlog':
      return 'Product Backlog'
    case 'sprint-backlog':
      return 'Sprint Backlog'
    case 'test':
      return 'Test'
    case 'done':
      return 'Done'
    default:
      return status
  }
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <section class="board-page">
    <div class="page-top">
      <div class="page-top-content">
        <span class="page-kicker">KANBAN WORKSPACE</span>
        <h1>Kanban Board</h1>
        <p>
          Görevleri profesyonel bir akışla yönet, kişilere ata ve durumlar arasında
          sürükleyip bırak.
        </p>
      </div>

      <div class="page-top-actions">
        <div class="column-create">
          <input
            v-model="newColumnTitle"
            type="text"
            placeholder="Yeni sütun adı"
            @keyup.enter="addColumn"
          />
          <button @click="addColumn">Sütun Ekle</button>
        </div>
      </div>
    </div>

    <div v-if="error" class="message error">{{ error }}</div>
    <div v-if="loading" class="message info">Yükleniyor...</div>

    <div v-else class="board-wrapper">
      <div class="board-columns">
        <section
          v-for="column in boardColumns"
          :key="column.id"
          class="column"
        >
          <header class="column-head">
            <div class="column-title-box">
              <div class="column-title-row">
                <h2>{{ column.title }}</h2>
                <span class="column-count">{{ column.tasks.length }}</span>
              </div>
              <span class="column-subtitle">Aktif görevler</span>
            </div>

            <button class="danger-btn" @click="deleteColumn(column.id)">
              Sil
            </button>
          </header>

          <div class="column-divider"></div>

          <button class="add-task" @click="openTaskModal(column.id)">
            + Bu Alana Görev Ekle
          </button>

          <draggable
            :list="column.tasks"
            group="tasks"
            item-key="id"
            class="task-list"
            ghost-class="ghost-card"
            chosen-class="chosen-card"
            drag-class="drag-card"
            @change="onTaskMoved($event, column.id)"
          >
            <template #item="{ element }">
              <article class="task-card">
                <div class="task-card-top">
                  <div class="task-title-wrap">
                    <h3>{{ element.title }}</h3>
                    <span class="task-pill" :class="`pill-${element.status}`">
                      {{ getStatusLabel(element.status) }}
                    </span>
                  </div>
                </div>

                <p v-if="element.description" class="desc">
                  {{ element.description }}
                </p>

                <div class="task-info-grid">
                  <div class="info-box">
                    <small>Atanan Kişi</small>
                    <select
                      class="assignee-select"
                      :value="element.assignedUserId || ''"
                      @change="updateTaskAssignee(element, $event.target.value)"
                    >
                      <option value="">Kişi seç</option>
                      <option
                        v-for="user in users"
                        :key="user.id"
                        :value="user.id"
                      >
                        {{ user.email }}
                      </option>
                    </select>
                  </div>

                  <div class="info-box">
                    <small>Bitiş Tarihi</small>
                    <input
                      type="date"
                      class="deadline-input"
                      :value="element.deadline || ''"
                      @change="updateTaskDeadline(element, $event.target.value)"
                    />
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
          <div>
            <span class="modal-kicker">YENİ GÖREV</span>
            <h2>Görev Oluştur</h2>
          </div>
          <button @click="closeTaskModal">Kapat</button>
        </div>

        <div class="form-group">
          <label>Başlık</label>
          <input v-model="form.title" type="text" placeholder="Görev başlığı" />
        </div>

        <div class="form-group">
          <label>Açıklama</label>
          <textarea
            v-model="form.description"
            rows="4"
            placeholder="Görev açıklaması"
          ></textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Kişiye Ata</label>
            <select v-model="form.assignedUserId" class="assignee-select">
              <option value="">Kişi seç</option>
              <option
                v-for="user in users"
                :key="user.id"
                :value="user.id"
              >
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
  max-width: 1560px;
  margin: 0 auto;
  padding: 28px 18px 42px;
}

.page-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  flex-wrap: wrap;
  margin-bottom: 24px;
  padding: 24px;
  border-radius: 28px;
  background:
    radial-gradient(circle at top left, rgba(37, 99, 235, 0.12), transparent 35%),
    linear-gradient(180deg, #ffffff, #f8fafc);
  border: 1px solid #e5e7eb;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.06);
}

.page-top-content {
  max-width: 760px;
}

.page-kicker,
.modal-kicker {
  display: inline-block;
  margin-bottom: 8px;
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: #2563eb;
}

.page-top h1 {
  margin: 0 0 10px;
  font-size: 2.3rem;
  color: #0f172a;
  line-height: 1.1;
}

.page-top p {
  margin: 0;
  color: #475569;
  line-height: 1.7;
  font-size: 1rem;
}

.page-top-actions {
  width: 100%;
  max-width: 430px;
}

.column-create {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  width: 100%;
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
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.column-create input:focus,
.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.12);
  outline: none;
}

.column-create button,
.add-task,
.primary,
.secondary,
.danger-btn,
.modal-top button {
  border: none;
  border-radius: 14px;
  padding: 11px 16px;
  font: inherit;
  cursor: pointer;
  transition: 0.25s ease;
}

.column-create button,
.primary {
  background: linear-gradient(180deg, #2563eb, #1d4ed8);
  color: #fff;
  font-weight: 700;
  box-shadow: 0 8px 18px rgba(37, 99, 235, 0.22);
}

.column-create button:hover,
.primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 24px rgba(37, 99, 235, 0.28);
}

.secondary,
.modal-top button {
  background: #e5e7eb;
  color: #111827;
  font-weight: 600;
}

.danger-btn {
  background: #fff1f2;
  color: #be123c;
  white-space: nowrap;
  font-weight: 700;
  border: 1px solid #fecdd3;
}

.danger-btn:hover {
  background: #ffe4e6;
}

.add-task {
  width: 100%;
  margin-bottom: 14px;
  background: #eff6ff;
  color: #1d4ed8;
  font-weight: 700;
  border: 1px solid #bfdbfe;
}

.add-task:hover {
  background: #dbeafe;
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
  overflow-y: hidden;
  padding-bottom: 12px;
  scroll-behavior: smooth;
  scrollbar-width: thin;
}

.board-wrapper::-webkit-scrollbar {
  height: 10px;
}

.board-wrapper::-webkit-scrollbar-track {
  background: #e5e7eb;
  border-radius: 999px;
}

.board-wrapper::-webkit-scrollbar-thumb {
  background: #94a3b8;
  border-radius: 999px;
}

.board-columns {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: clamp(300px, 28vw, 360px);
  gap: 18px;
  align-items: start;
  width: max-content;
  min-width: 100%;
}

.column {
  width: 100%;
  min-width: 0;
  background: linear-gradient(180deg, #f8fafc, #ffffff);
  border: 1px solid #dbe3ee;
  border-radius: 24px;
  padding: 16px;
  box-sizing: border-box;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.06);
}

@media (max-width: 980px) {
  .board-columns {
    grid-auto-columns: clamp(280px, 72vw, 320px);
  }
}

@media (max-width: 768px) {
  .board-columns {
    grid-auto-columns: 88vw;
    gap: 14px;
  }

  .column {
    padding: 14px;
    border-radius: 20px;
  }
}

.column-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
}

.column-title-box {
  flex: 1;
}

.column-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 4px;
}

.column-title-box h2 {
  margin: 0;
  font-size: 1.05rem;
  color: #0f172a;
}

.column-count {
  min-width: 28px;
  height: 28px;
  padding: 0 8px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #e2e8f0;
  color: #334155;
  font-size: 0.82rem;
  font-weight: 700;
}

.column-subtitle {
  color: #64748b;
  font-size: 0.86rem;
}

.column-divider {
  width: 100%;
  border-top: 2px dashed #cbd5e1;
  margin: 14px 0;
}

.task-list {
  min-height: 220px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 8px;
  border: 2px dashed #dbe3ee;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.8);
}

.task-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  padding: 15px;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.task-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 28px rgba(15, 23, 42, 0.09);
  border-color: #cbd5e1;
}

.task-card-top {
  margin-bottom: 10px;
}

.task-title-wrap {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
}

.task-card h3 {
  margin: 0;
  font-size: 1rem;
  color: #0f172a;
  line-height: 1.45;
}

.task-pill {
  white-space: nowrap;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 0.74rem;
  font-weight: 800;
  border: 1px solid transparent;
}

.pill-product-backlog {
  background: #dbeafe;
  color: #1d4ed8;
  border-color: #bfdbfe;
}

.pill-sprint-backlog {
  background: #fef3c7;
  color: #92400e;
  border-color: #fde68a;
}

.pill-test {
  background: #ede9fe;
  color: #6d28d9;
  border-color: #ddd6fe;
}

.pill-done {
  background: #dcfce7;
  color: #166534;
  border-color: #bbf7d0;
}

.desc {
  margin: 0 0 14px;
  color: #475569;
  line-height: 1.6;
  font-size: 0.95rem;
}

.task-info-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

.info-box {
  padding: 11px 12px;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
}

.info-box small {
  display: block;
  color: #64748b;
  margin-bottom: 6px;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.ghost-card {
  opacity: 0.45;
}

.chosen-card {
  transform: rotate(1deg) scale(1.01);
}

.drag-card {
  cursor: grabbing;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(3px);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  z-index: 999;
}

.modal {
  width: 100%;
  max-width: 680px;
  background: white;
  border-radius: 24px;
  padding: 22px;
  box-sizing: border-box;
  box-shadow: 0 28px 70px rgba(15, 23, 42, 0.24);
}

.modal-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 18px;
}

.modal-top h2 {
  margin: 0;
  color: #111827;
}

.form-group {
  margin-bottom: 14px;
}

.form-group label {
  display: block;
  font-weight: 700;
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

@media (max-width: 980px) {
  .column {
    width: 320px;
    min-width: 320px;
  }
}

@media (max-width: 768px) {
  .page-top {
    flex-direction: column;
    align-items: stretch;
    padding: 20px;
  }

  .page-top h1 {
    font-size: 1.9rem;
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
    font-size: 1.55rem;
  }

  .column {
    width: 88vw;
    min-width: 88vw;
    padding: 14px;
    border-radius: 20px;
  }

  .column-head {
    flex-direction: column;
    align-items: stretch;
  }

  .task-title-wrap {
    flex-direction: column;
  }

  .task-list {
    min-height: 150px;
  }

  .modal {
    padding: 18px;
    border-radius: 20px;
  }
}
</style>
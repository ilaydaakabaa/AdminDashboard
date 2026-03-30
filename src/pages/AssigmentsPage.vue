<template>
  <section class="assignments-page">
    <div class="assignments-header">
      <h1>Benim Atadığım Görevler</h1>
      <p>Başka kullanıcılara atadığın görevleri buradan görebilirsin.</p>
    </div>

    <div v-if="isLoading" class="state-box">
      <p>Görevler yükleniyor...</p>
    </div>

    <div v-else-if="tasks.length === 0" class="state-box">
      <p>Henüz başka kullanıcılara görev atamadın.</p>
    </div>

    <div v-else class="task-grid">
      <article v-for="task in tasks" :key="task.id" class="task-card">
        <div class="task-top">
          <h3>{{ task.title }}</h3>
          <span class="status-badge" :class="task.status === 'done' ? 'completed' : 'pending'">
            {{ task.status === 'done' ? 'Tamamlandi' : 'Bekliyor' }}
          </span>
        </div>

        <p class="task-description">{{ task.description }}</p>
        

        <div class="task-meta">
          <p><strong>Atanan:</strong> {{ getUserEmail(task.assignedUserId) }}</p>
          <p><strong>Deadline:</strong> {{ formatDeadline(task.deadline) }}</p>
        </div>
       
        <router-link :to="`/tasks/${task.id}/edit`" class="edit-link">
          Detay / Düzenle
        </router-link>



      </article>
    </div>

    <p v-if="error" class="error-message">{{ error }}</p>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

const token = computed(() => store.getters['auth/token'])
const userId = computed(() => store.getters['auth/userId'])
const allTasks = computed(() => store.getters['tasks/tasks'] || [])
const tasks = computed(() => {
  return [...allTasks.value]
    .filter(task => task.assignedById === userId.value)
    .sort((a, b) => {
      const aTime = a.deadline ? new Date(a.deadline).getTime() : Number.POSITIVE_INFINITY
      const bTime = b.deadline ? new Date(b.deadline).getTime() : Number.POSITIVE_INFINITY
      return aTime - bTime
    })
})
const users = computed(() => store.getters['tasks/users'])

const isLoading = ref(false)
const error = ref('')

function formatDeadline(deadline) {
  if (!deadline) {
    return 'Belirtilmedi'
  }

  return new Date(deadline).toLocaleDateString('tr-TR')
}

function getUserEmail(id) {
  const user = users.value.find(item => item.id === id)
  return user?.email || 'Bilinmiyor'
}

onMounted(async () => {
  isLoading.value = true
  error.value = ''

  try {
    await Promise.all([
      store.dispatch('tasks/fetchUsers', {
        token: token.value
      }),
      store.dispatch('tasks/fetchTasks', {
        token: token.value,
        userId: userId.value
      })
    ])
  } catch (err) {
    error.value = err.message || 'Görevler alınamadı.'
  } finally {
    isLoading.value = false
  }
})

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
</script>

<style scoped>
.assignments-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 16px 48px;
}

.assignments-header {
  margin-bottom: 20px;
}

.assignments-header h1 {
  margin: 0 0 8px;
  font-size: 2rem;
  color: #111827;
}

.assignments-header p {
  margin: 0;
  color: #6b7280;
}

.state-box {
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 16px;
  color: #374151;
}

.task-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.task-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 18px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
}

.task-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.task-top h3 {
  margin: 0;
}

.task-description {
  margin: 0 0 12px;
  color: #6b7280;
}

.task-meta {
  margin-bottom: 14px;
  background: #f8fafc;
  border-radius: 10px;
  padding: 10px;
}

.task-meta p {
  margin: 0;
  color: #374151;
}

.task-meta p + p {
  margin-top: 6px;
}

.status-badge {
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 700;
}

.completed {
  background: #dcfce7;
  color: #166534;
}

.pending {
  background: #fef3c7;
  color: #92400e;
}

.edit-link {
  display: inline-block;
  text-decoration: none;
  color: #1d4ed8;
  font-weight: 700;
}

.error-message {
  margin-top: 16px;
  background: #fef2f2;
  color: #b91c1c;
  padding: 12px 14px;
  border-radius: 12px;
}

@media (max-width: 900px) {
  .task-grid {
    grid-template-columns: 1fr;
  }
}
</style>
<template>
  <section class="tasks-page">
    <div class="tasks-header">
      <div>
        <h1>Tüm Görevler</h1>
        <p>Board’undaki tüm görevleri buradan takip edebilirsin.</p>
      </div>

      <router-link to="/tasks/new" class="add-task-btn">
        + Yeni Görev
      </router-link>
    </div>

    <div v-if="tasks.length === 0" class="empty-state">
      Henüz görev bulunmuyor.
    </div>

    <TaskList
      v-else
      :tasks="sortedTasks"
      @delete-task="removeTaskById"
      
    />
  </section>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import TaskList from '@/components/tasks/TaskList.vue'

const store = useStore()
const router = useRouter()

const token = computed(() => store.getters['auth/token'])
const userId = computed(() => store.getters['auth/userId'])

// Artık sadece bana atananları değil, board'daki tüm taskları alıyoruz
const tasks = computed(() => store.getters['tasks/tasks'] || [])

const sortedTasks = computed(() => {
  return [...tasks.value].sort((a, b) => {
    const aTime = a.createdAt ?? 0
    const bTime = b.createdAt ?? 0
    return bTime - aTime
  })
})

async function removeTaskById(taskId, ownerUserId) {
  try {
    await store.dispatch('tasks/deleteTask', {
      token: token.value,
      userId: userId.value,
      taskId,
      ownerUserId
    })
  } catch (error) {
    error.value = error.message || 'Görev silinemedi.'
  }
}

// function goToEditPage(taskId) {
//   router.push(`/tasks/${taskId}/edit`)
// }

onMounted(async () => {
  try {
    await store.dispatch('tasks/fetchVisibleTasks', {
      token: token.value,
      userId: userId.value
    })
  } catch (error) {
    console.error(error)
  }
})
</script>

<style scoped>
.tasks-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 16px 48px;
}

.tasks-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.tasks-header h1 {
  margin: 0 0 8px;
  font-size: 2rem;
  color: #111827;
}

.tasks-header p {
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

.empty-state {
  padding: 18px;
  border-radius: 14px;
  background: #f9fafb;
  color: #6b7280;
  border: 1px dashed #d1d5db;
}
</style>
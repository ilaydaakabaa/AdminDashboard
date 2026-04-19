<template>
  <section class="task-form-page" v-if="task">
    <TaskForm
      :initialTask="task"
      :isLoading="isLoading"
      :users="users"
      :currentUserId="userId"
      @submit="handleEditTask"
    />
  </section>

  <section v-else class="not-found">
    <p>Görev bulunamadı.</p>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import TaskForm from '@/components/tasks/TaskForm.vue'

const route = useRoute()
const router = useRouter()
const store = useStore()

const isLoading = ref(false)
const taskId = route.params.id

const token = computed(() => store.getters['auth/token'])
const userId = computed(() => store.getters['auth/userId'])
const task = computed(() => store.getters['tasks/getTaskById'](taskId))
const users = computed(() => store.getters['tasks/users'])

onMounted(async () => {
  try {
    await store.dispatch('tasks/fetchUsers', {
      token: token.value
    })
  } catch (error) {
    console.error(error)
  }

  if (!store.getters['tasks/tasks'].length) {
    try {
      await store.dispatch('tasks/fetchTasks', {
        token: token.value,
        userId: userId.value
      })
    } catch (error) {
      console.error(error)
    }
  }
})

async function handleEditTask(taskData) {
  isLoading.value = true

  try {
    await store.dispatch('tasks/editTask', {
      id: taskId,
      title: taskData.title,
      description: taskData.description,
      status: taskData.status,
      assignedUserId: taskData.assignedUserId,
      deadline: taskData.deadline,
      token: token.value,
      userId: userId.value,
      assignedById: task.value.assignedById,
      ownerUserId: task.value.ownerUserId

    })

    router.push('/tasks')
  } catch (error) {
    console.error(error)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.task-form-page {
  min-height: calc(100vh - 110px);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 32px 16px;
  background: linear-gradient(180deg, #f8fafc, #eef2ff);
}

.not-found {
  padding: 40px 16px;
  text-align: center;
}
</style>
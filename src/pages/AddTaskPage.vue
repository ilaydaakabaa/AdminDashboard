<template>
  <section class="task-form-page">
    <TaskForm
      :isLoading="isLoading"
      :users="users"
      :currentUserId="userId"
      @submit="handleSubmitTask"
    />
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import TaskForm from '@/components/tasks/TaskForm.vue'

const store = useStore()
const router = useRouter()

const isLoading = ref(false)

const token = computed(() => store.getters['auth/token'])
const userId = computed(() => store.getters['auth/userId'])
const userEmail = computed(() => store.getters['auth/email'])
const users = computed(() => store.getters['tasks/users'])

onMounted(async () => {
  try {
    await store.dispatch('tasks/fetchUsers', {
      token: token.value
    })
  } catch (error) {
    console.error(error)
  }
})

async function handleSubmitTask(taskData) {
  isLoading.value = true

  try {
    await store.dispatch('tasks/addTask', {
      title: taskData.title,
      description: taskData.description,
      status: taskData.status,
      token: token.value,
      userId: userId.value,
      assignedUserId: taskData.assignedUserId,
      assignedById: userId.value,
      assignedByEmail: userEmail.value,
      deadline: taskData.deadline

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
</style>
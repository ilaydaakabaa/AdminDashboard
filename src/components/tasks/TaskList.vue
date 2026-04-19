<template>
  <div class="task-grid">
    <TaskItem
      v-for="task in tasks"
      :key="task.id"
      :task="task"
      @delete="$emit('delete-task', $event)"
     
    />
  </div>
</template>

<script setup>
import TaskItem from './TaskItem.vue'

defineProps({
  tasks: {
    type: Array,
    default: () => []
  }
})

defineEmits(['delete-task'])
</script>

<style scoped>
.task-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18px;
}

@media (max-width: 900px) {
  .task-grid {
    grid-template-columns: 1fr;
  }
}
</style>
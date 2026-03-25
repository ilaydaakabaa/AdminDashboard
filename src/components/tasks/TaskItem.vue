<template>
  <article class="task-card">
    <div class="task-top">
      <h3>{{ task.title }}</h3>

      <span
        class="status-badge"
        :class="task.status === 'completed' ? 'completed' : 'pending'"
      >
        {{ task.status === 'completed' ? 'Tamamlandı' : 'Bekliyor' }}
      </span>
    </div>

    <p class="task-description">{{ task.description }}</p>

    <div class="task-actions">
      <button class="edit-btn" @click="$emit('edit', task.id)">
        Düzenle
      </button>

      <button class="toggle-btn" @click="$emit('toggle-status', task.id)">
        {{ task.status === 'completed' ? 'Bekliyor Yap' : 'Tamamlandı Yap' }}
      </button>

      <button class="delete-btn" @click="$emit('delete', task.id)">
        Sil
      </button>
    </div>
  </article>
</template>

<script setup>
defineProps({
  task: {
    type: Object,
    required: true
  }
})

defineEmits(['edit', 'toggle-status', 'delete'])
</script>

<style scoped>
.task-card {
  background: white;
  border-radius: 18px;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
}

.task-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.task-top h3 {
  margin: 0;
}

.task-description {
  color: #6b7280;
  line-height: 1.6;
  margin-bottom: 16px;
}

.status-badge {
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 0.9rem;
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

.task-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.edit-btn,
.toggle-btn,
.delete-btn {
  border: none;
  padding: 10px 14px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
}

.edit-btn {
  background: #dbeafe;
  color: #1d4ed8;
}

.toggle-btn {
  background: #ede9fe;
  color: #6d28d9;
}

.delete-btn {
  background: #fee2e2;
  color: #dc2626;
}
</style>
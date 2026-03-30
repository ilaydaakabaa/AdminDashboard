<template>
  <article class="task-card">
    <div class="task-top">
      <h3>{{ task.title }}</h3>

      <span class="status-badge" :class="task.status === 'done' ? 'completed' : 'pending'">
        {{ statusLabel }}
      </span>
    </div>

    <p class="task-description">{{ task.description }}</p>

    <div class="task-meta">
      <p>
        Son Tarih:
        <strong>{{ formattedDeadline }}</strong>
      </p>

      <p>
        Atayan:
        <strong>{{ task.assignedByEmail || 'Bilinmiyor' }}</strong>
      </p>

      <p>
        Atanan:
        <strong>{{ task.assignedUserEmail || 'Atanmadı' }}</strong>
      </p>
    </div>

    <div class="task-actions">
      <button class="edit-btn" @click="$emit('edit', task.id)">
        Düzenle
      </button>

      <button class="delete-btn" @click="$emit('delete', task.id)">
        Sil
      </button>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  task: {
    type: Object,
    required: true
  }
})

const formattedDeadline = computed(() => {
  if (!props.task.deadline) {
    return 'Belirtilmedi'
  }

  return new Date(props.task.deadline).toLocaleDateString('tr-TR')
})

const statusLabel = computed(() => {
  switch (props.task.status) {
    case 'product-backlog':
      return 'Product Backlog'
    case 'sprint-backlog':
      return 'Sprint Backlog'
    case 'test':
      return 'Test'
    case 'done':
      return 'Tamamlandı'
    default:
      return props.task.status || 'Belirsiz'
  }
})

defineEmits(['edit', 'delete'])
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
  margin-bottom: 14px;
}

.task-meta {
  margin-bottom: 14px;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 10px 12px;
}

.task-meta p {
  margin: 0;
  color: #374151;
  font-size: 0.92rem;
}

.task-meta p + p {
  margin-top: 6px;
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

.delete-btn {
  background: #fee2e2;
  color: #dc2626;
}
</style>
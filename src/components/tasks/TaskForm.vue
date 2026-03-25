<template>
  <div class="task-form-card">
    <div class="task-form-top">
      <h1>{{ isEdit ? 'Görevi Düzenle' : 'Yeni Görev Oluştur' }}</h1>
      <p>
        {{
          isEdit
            ? 'Görev bilgilerini güncelleyebilirsin.'
            : 'Yeni görev ekleyerek çalışma planını düzenli tutabilirsin.'
        }}
      </p>
    </div>

    <form class="task-form" @submit.prevent="submitForm">
      <div class="form-control">
        <label for="title">Başlık</label>
        <input
          id="title"
          type="text"
          v-model.trim="title"
          placeholder="Görev başlığını gir"
        />
      </div>

      <div class="form-control">
        <label for="description">Açıklama</label>
        <textarea
          id="description"
          v-model.trim="description"
          rows="5"
          placeholder="Görev açıklamasını gir"
        ></textarea>
      </div>

      <div class="form-control">
        <label for="status">Durum</label>
        <select id="status" v-model="status">
          <option value="pending">Bekliyor</option>
          <option value="completed">Tamamlandı</option>
        </select>
      </div>

      <p v-if="error" class="error-message">{{ error }}</p>

      <button class="submit-btn" :disabled="isLoading">
        {{ isLoading ? 'Kaydediliyor...' : isEdit ? 'Güncelle' : 'Görevi Kaydet' }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  isLoading: {
    type: Boolean,
    default: false
  },
  initialTask: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['submit'])

const title = ref('')
const description = ref('')
const status = ref('pending')
const error = ref('')

const isEdit = computed(() => !!props.initialTask)

watch(
  () => props.initialTask,
  (newTask) => {
    title.value = newTask?.title || ''
    description.value = newTask?.description || ''
    status.value = newTask?.status || 'pending'
  },
  { immediate: true }
)

function submitForm() {
  error.value = ''

  if (!title.value || !description.value) {
    error.value = 'Lütfen tüm alanları doldurun.'
    return
  }

  emit('submit', {
    title: title.value,
    description: description.value,
    status: status.value
  })
}
</script>

<style scoped>
.task-form-card {
  width: 100%;
  max-width: 560px;
  background: white;
  border-radius: 22px;
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.10);
  padding: 32px 28px;
}

.task-form-top {
  text-align: center;
  margin-bottom: 24px;
}

.task-form-top h1 {
  margin: 0 0 10px;
  font-size: 2rem;
  color: #111827;
}

.task-form-top p {
  margin: 0;
  color: #6b7280;
  line-height: 1.6;
}

.task-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-control {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-control label {
  font-weight: 600;
  color: #374151;
}

.form-control input,
.form-control textarea,
.form-control select {
  border: 1px solid #d1d5db;
  border-radius: 12px;
  padding: 14px 15px;
  font-size: 1rem;
  outline: none;
  transition: 0.25s ease;
  background: #f9fafb;
  font-family: inherit;
}

.form-control input:focus,
.form-control textarea:focus,
.form-control select:focus {
  border-color: #2563eb;
  background: #ffffff;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.12);
}

textarea {
  resize: vertical;
}

.submit-btn {
  margin-top: 6px;
  border: none;
  background: #2563eb;
  color: white;
  padding: 14px 16px;
  border-radius: 12px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 700;
  transition: 0.25s ease;
}

.submit-btn:hover {
  background: #1d4ed8;
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error-message {
  margin: 0;
  background: #fef2f2;
  color: #b91c1c;
  padding: 12px 14px;
  border-radius: 12px;
  font-size: 0.95rem;
}
</style>
<template>
  <section class="auth-page">
    <div class="auth-card">
      <div class="auth-top">
        <h1>Create Account</h1>
        <p>TaskFlow'a katıl, görevlerini planla ve sürecini düzenli takip et.</p>
      </div>

      <form class="auth-form" @submit.prevent="submitRegister">
        <div class="form-control">
          <label for="email">E-posta</label>
          <input
            id="email"
            type="email"
            v-model.trim="email"
            placeholder="ornek@mail.com"
          />
        </div>

        <div class="form-control">
          <label for="password">Şifre</label>
          <input
            id="password"
            type="password"
            v-model.trim="password"
            placeholder="Şifrenizi oluşturun"
          />
        </div>

        <div class="form-control">
          <label for="confirmPassword">Şifre Tekrar</label>
          <input
            id="confirmPassword"
            type="password"
            v-model.trim="confirmPassword"
            placeholder="Şifrenizi tekrar girin"
          />
        </div>

        <p v-if="error" class="error-message">{{ error }}</p>

        <button class="submit-btn" :disabled="isLoading">
          {{ isLoading ? 'Kayıt oluşturuluyor...' : 'Register' }}
        </button>
      </form>

      <div class="auth-bottom">
        <p>Zaten hesabın var mı?</p>
        <router-link to="/login">Login</router-link>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const isLoading = ref(false)

const store = useStore()
const router = useRouter()

function getFirebaseErrorMessage(code) {
  switch (code) {
    case 'EMAIL_EXISTS':
      return 'Bu e-posta adresi zaten kayıtlı.'
    case 'OPERATION_NOT_ALLOWED':
      return 'Email/Password giriş yöntemi aktif değil.'
    case 'WEAK_PASSWORD':
      return 'Daha güçlü bir şifre kullanın.'
    default:
      return 'Kayıt sırasında bir hata oluştu.'
  }
}

async function submitRegister() {
  error.value = ''

  if (!email.value || !password.value || !confirmPassword.value) {
    error.value = 'Lütfen tüm alanları doldurun.'
    return
  }

  if (password.value.length < 6) {
    error.value = 'Şifre en az 6 karakter olmalıdır.'
    return
  }

  if (password.value !== confirmPassword.value) {
    error.value = 'Şifreler birbiriyle eşleşmiyor.'
    return
  }

  isLoading.value = true

  try {
    await store.dispatch('auth/register', {
      email: email.value,
      password: password.value
    })

    router.push('/dashboard')
  } catch (err) {
    error.value = getFirebaseErrorMessage(err.message)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  min-height: calc(100vh - 110px);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 32px 16px;
  background: linear-gradient(180deg, #f8fafc, #eef2ff);
}

.auth-card {
  width: 100%;
  max-width: 460px;
  background: #ffffff;
  border-radius: 22px;
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.10);
  padding: 32px 28px;
}

.auth-top {
  text-align: center;
  margin-bottom: 24px;
}

.auth-top h1 {
  margin: 0 0 10px;
  font-size: 2rem;
  color: #111827;
}

.auth-top p {
  margin: 0;
  color: #6b7280;
  line-height: 1.6;
}

.auth-form {
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

.form-control input {
  border: 1px solid #d1d5db;
  border-radius: 12px;
  padding: 14px 15px;
  font-size: 1rem;
  outline: none;
  transition: 0.25s ease;
  background: #f9fafb;
}

.form-control input:focus {
  border-color: #2563eb;
  background: #ffffff;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.12);
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

.auth-bottom {
  margin-top: 22px;
  text-align: center;
  color: #6b7280;
}

.auth-bottom p {
  margin: 0 0 8px;
}

.auth-bottom a {
  color: #2563eb;
  text-decoration: none;
  font-weight: 700;
}

.auth-bottom a:hover {
  text-decoration: underline;
}

@media (max-width: 480px) {
  .auth-card {
    padding: 24px 18px;
    border-radius: 18px;
  }

  .auth-top h1 {
    font-size: 1.7rem;
  }
}
</style>
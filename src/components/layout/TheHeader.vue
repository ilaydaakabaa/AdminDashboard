<template>
  <header class="header">
    <div class="header-inner">
      <router-link to="/" class="logo">TaskFlow</router-link>

      <nav class="nav">
        <router-link to="/" class="nav-link">Home</router-link>

        <template v-if="!isAuthenticated">
          <router-link to="/login" class="nav-link">Login</router-link>
          <router-link to="/register" class="nav-link nav-link-primary">Register</router-link>
        </template>

        <template v-else>
          <router-link to="/dashboard" class="nav-link">Dashboard</router-link>
          <router-link to="/tasks" class="nav-link">Tasks</router-link>
          <router-link to="/tasks/new" class="nav-link">Add Task</router-link>

          <div class="user-box">
            <span class="user-email">{{ userEmail }}</span>
            <button class="logout-btn" @click="logoutUser">Logout</button>
          </div>
        </template>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

const store = useStore()
const router = useRouter()

const isAuthenticated = computed(() => store.getters['auth/isAuthenticated'])
const userEmail = computed(() => store.getters['auth/email'])

function logoutUser() {
  store.dispatch('auth/logout')
  router.push('/login')
}
</script>

<style scoped>
.header {
  background: linear-gradient(135deg, #111827, #1f2937);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 18px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.logo {
  color: #ffffff;
  text-decoration: none;
  font-size: 1.35rem;
  font-weight: 800;
  letter-spacing: 0.5px;
}

.nav {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.nav-link {
  color: #e5e7eb;
  text-decoration: none;
  padding: 10px 14px;
  border-radius: 10px;
  transition: 0.25s ease;
  font-weight: 500;
}

.nav-link:hover,
.nav-link.router-link-active {
  background-color: rgba(255, 255, 255, 0.08);
  color: #ffffff;
}

.nav-link-primary {
  background: #2563eb;
  color: #ffffff;
}

.nav-link-primary:hover {
  background: #1d4ed8;
}

.user-box {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.user-email {
  color: #cbd5e1;
  font-size: 0.95rem;
  background: rgba(255, 255, 255, 0.06);
  padding: 8px 12px;
  border-radius: 999px;
}

.logout-btn {
  border: none;
  background: #ef4444;
  color: white;
  padding: 10px 14px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  transition: 0.25s ease;
}

.logout-btn:hover {
  background: #dc2626;
}

@media (max-width: 768px) {
  .header-inner {
    flex-direction: column;
    align-items: stretch;
  }

  .logo {
    text-align: center;
  }

  .nav {
    justify-content: center;
  }

  .user-box {
    justify-content: center;
  }
}
</style>
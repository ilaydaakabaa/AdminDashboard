<template>
  <header class="header">
    <div class="header-inner">
      <div class="header-top">
        <router-link to="/" class="logo" @click="closeMenu">TaskFlow</router-link>

        <button
          class="menu-toggle"
          type="button"
          :aria-expanded="isMenuOpen ? 'true' : 'false'"
          aria-label="Menuyu ac veya kapat"
          @click="toggleMenu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      <nav class="nav" :class="{ 'is-open': isMenuOpen }">
        <router-link to="/" class="nav-link" @click="closeMenu">Home</router-link>

        <template v-if="!isAuthenticated">
          <router-link to="/login" class="nav-link" @click="closeMenu">Login</router-link>
          <router-link to="/register" class="nav-link nav-link-primary" @click="closeMenu">Register</router-link>
        </template>

        <template v-else>
          <router-link to="/dashboard" class="nav-link" @click="closeMenu">Dashboard</router-link>
          <router-link to="/tasks" class="nav-link" @click="closeMenu">Tasks</router-link>
          <!-- <router-link to="/assignments" class="nav-link" @click="closeMenu">Assignments</router-link> -->
          <router-link to="/tasks/new" class="nav-link" @click="closeMenu">Add Task</router-link>

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
import { computed, ref, watch } from 'vue'
import { useStore } from 'vuex'
import { useRoute, useRouter } from 'vue-router'

const store = useStore()
const route = useRoute()
const router = useRouter()

const isAuthenticated = computed(() => store.getters['auth/isAuthenticated'])
const userEmail = computed(() => store.getters['auth/email'])
const isMenuOpen = ref(false)

watch(
  () => route.fullPath,
  () => {
    isMenuOpen.value = false
  }
)

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
}

function closeMenu() {
  isMenuOpen.value = false
}

function logoutUser() {
  store.dispatch('auth/logout')
  closeMenu()
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
  width: 100%;
}

.header-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 18px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  position: relative;
}

.logo {
  color: #ffffff;
  text-decoration: none;
  font-size: 1.35rem;
  font-weight: 800;
  letter-spacing: 0.5px;
  white-space: nowrap;
  flex-shrink: 0;
}

.nav {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  flex: 1;
  flex-wrap: wrap;
  min-width: 0;
}

.nav-link {
  color: #e5e7eb;
  text-decoration: none;
  padding: 10px 14px;
  border-radius: 10px;
  transition: 0.25s ease;
  font-weight: 500;
  white-space: nowrap;
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
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  white-space: nowrap;
}

.logout-btn:hover {
  background: #dc2626;
}

.menu-toggle {
  display: none;
  border: 1px solid rgba(255, 255, 255, 0.25);
  background: rgba(255, 255, 255, 0.06);
  width: 42px;
  height: 38px;
  border-radius: 10px;
  cursor: pointer;
  padding: 8px;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
}

.menu-toggle span {
  display: block;
  width: 100%;
  height: 2px;
  background: #e5e7eb;
}

/* 1100px altı: hamburger menüye geç */
@media (max-width: 1100px) {
  .header-inner {
    padding: 14px 16px;
    flex-wrap: wrap;
  }

  .menu-toggle {
    display: flex;
    margin-left: auto;
  }

  .nav {
    display: none;
    width: 100%;
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
    margin-top: 12px;
  }

  .nav.is-open {
    display: flex;
  }

  .nav-link {
    width: 100%;
    text-align: center;
    box-sizing: border-box;
  }

  .user-box {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
  }

  .user-email {
    max-width: 100%;
    text-align: center;
    border-radius: 10px;
  }

  .logout-btn {
    width: 100%;
  }
}
</style>
<script setup>
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

const store = useStore()
const router = useRouter()

function logoutHandler() {
  store.dispatch('auth/logout')
  router.replace('/login')
}
</script>

<template>
  <div class="shell">
    <aside class="sidebar">
      
      <div class="brand">
        <span class="brand__dot"></span>
        <h2>Admin</h2>
      </div>

      <nav class="nav-list">
        <router-link to="/dashboard" class="nav-link" active-class="is-active">
          Dashboard
        </router-link>
      </nav>

      <!-- logout -->
      <div class="sidebar-footer">
        <button class="logout-btn" @click="logoutHandler">
          Çıkış Yap
        </button>
      </div>

    </aside>
    
    <main class="content">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 270px 1fr;
  background: #f3f4f6;
}

.sidebar {
  background:
    linear-gradient(180deg, rgba(17, 24, 39, 0.95), rgba(31, 41, 55, 0.92)),
    radial-gradient(circle at 80% 12%, rgba(251, 191, 36, 0.24), transparent 40%);
  color: white;
  padding: 26px 20px;
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.brand h2 {
  margin: 0;
  font-size: 22px;
}

.brand__dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: #fbbf24;
  box-shadow: 0 0 0 6px rgba(251, 191, 36, 0.2);
}

.nav-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-link {
  display: block;
  color: rgba(255, 255, 255, 0.88);
  text-decoration: none;
  border-radius: 10px;
  padding: 10px 12px;
  transition: background-color 0.2s ease;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.1);
}

.nav-link.is-active {
  background: rgba(251, 191, 36, 0.18);
  color: #fef3c7;
}

/* logout area */

.sidebar-footer {
  margin-top: auto;
}

.logout-btn {
  width: 100%;
  border: none;
  background: rgba(239, 68, 68, 0.2);
  color: #fecaca;
  padding: 10px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.35);
}

/* content */

.content {
  padding: 28px;
  background:
    radial-gradient(circle at 8% 10%, rgba(251, 191, 36, 0.08), transparent 22%),
    radial-gradient(circle at 95% 4%, rgba(59, 130, 246, 0.08), transparent 20%),
    #f8fafc;
}

/* responsive */

@media (max-width: 920px) {
  .shell {
    grid-template-columns: 1fr;
  }

  .sidebar {
    flex-direction: row;
    align-items: center;
    flex-wrap: wrap;
    padding: 16px;
    gap: 12px;
  }

  .nav-list {
    flex-direction: row;
  }

  .sidebar-footer {
    width: 100%;
  }

  .content {
    padding: 16px;
  }
}
</style>
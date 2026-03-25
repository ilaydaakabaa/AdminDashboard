import { createRouter, createWebHistory } from 'vue-router'
import store from '../stores'
import LoginPage from '@/pages/LoginPage.vue'
import RegisterPage from '@/pages/RegisterPage.vue'
import DashboardPage from '@/pages/DashboardPage.vue'
import TasksPage from '@/pages/TasksPage.vue'
import AddTaskPage from '@/pages/AddTaskPage.vue'
import HomePage from '@/pages/HomePage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [

    { path: '/', component: HomePage },
    { path: '/login', component: LoginPage, meta: { requiresUnauth: true } },
    { path: '/register', component: RegisterPage, meta: { requiresUnauth: true } },
    { path: '/dashboard', component: DashboardPage, meta: { requiresAuth: true } },
    { path: '/tasks', component: TasksPage, meta: { requiresAuth: true } },
    { path: '/tasks/new', component: AddTaskPage, meta: { requiresAuth: true } },
    {
      path: '/tasks/:id/edit',
      name: 'EditTask',
      component: () => import('@/pages/EditTaskPage.vue')
    }
  ]
})

router.beforeEach((to, from) => {
  const isAuthenticated = store.getters['auth/isAuthenticated']

  if (to.meta.requiresAuth && !isAuthenticated) {
    return '/login'
  }

  if (to.meta.requiresUnauth && isAuthenticated) {
    return '/dashboard'
  }

  return true
})

export default router
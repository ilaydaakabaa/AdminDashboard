const DATABASE_URL = import.meta.env.VITE_FIREBASE_DATABASE_URL

export default {
  namespaced: true,

  state() {
    return {
      tasks: []
    }
  },

  mutations: {
    setTasks(state, payload) {
      state.tasks = payload
    },
    addTask(state, payload) {
      state.tasks.push(payload)
    },
    removeTask(state, taskId) {
      state.tasks = state.tasks.filter(task => task.id !== taskId)
    },
    editTask(state, payload) {
      const taskIndex = state.tasks.findIndex(task => task.id === payload.id)

      if (taskIndex !== -1) {
        state.tasks[taskIndex] = {
          ...state.tasks[taskIndex],
          ...payload
        }
      }
    }
  },

  getters: {
    tasks(state) {
      return state.tasks
    },
    totalTasks(state) {
      return state.tasks.length
    },
    completedTasks(state) {
      return state.tasks.filter(task => task.status === 'completed')
    },
    pendingTasks(state) {
      return state.tasks.filter(task => task.status === 'pending')
    },
    getTaskById: (state) => (taskId) => {
      return state.tasks.find(task => task.id === taskId)
    }
  },

  actions: {
    async fetchTasks({ commit }, payload) {
      const response = await fetch(
        `${DATABASE_URL}/tasks/${payload.userId}.json?auth=${payload.token}`
      )

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error('Görevler alınamadı.')
      }

      const loadedTasks = []

      if (responseData) {
        for (const key in responseData) {
          loadedTasks.push({
            id: key,
            title: responseData[key].title,
            description: responseData[key].description,
            status: responseData[key].status
          })
        }
      }

      commit('setTasks', loadedTasks)
    },

    async addTask({ commit }, payload) {
      const response = await fetch(
        `${DATABASE_URL}/tasks/${payload.userId}.json?auth=${payload.token}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: payload.title,
            description: payload.description,
            status: payload.status
          })
        }
      )

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error('Görev eklenemedi.')
      }

      commit('addTask', {
        id: responseData.name,
        title: payload.title,
        description: payload.description,
        status: payload.status
      })
    },

    async removeTask({ commit }, payload) {
      const response = await fetch(
        `${DATABASE_URL}/tasks/${payload.userId}/${payload.taskId}.json?auth=${payload.token}`,
        {
          method: 'DELETE'
        }
      )

      if (!response.ok) {
        throw new Error('Görev silinemedi.')
      }

      commit('removeTask', payload.taskId)
    },

    async editTask({ commit }, payload) {
      const response = await fetch(
        `${DATABASE_URL}/tasks/${payload.userId}/${payload.id}.json?auth=${payload.token}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: payload.title,
            description: payload.description,
            status: payload.status
          })
        }
      )

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error('Görev güncellenemedi.')
      }

      commit('editTask', {
        id: payload.id,
        title: payload.title,
        description: payload.description,
        status: payload.status
      })
    },

    async toggleTaskStatus({ dispatch, getters, rootGetters }, taskId) {
      const task = getters.getTaskById(taskId)

      if (!task) {
        throw new Error('Görev bulunamadı.')
      }

      const newStatus = task.status === 'completed' ? 'pending' : 'completed'

      await dispatch('editTask', {
        id: task.id,
        title: task.title,
        description: task.description,
        status: newStatus,
        token: rootGetters['auth/token'],
        userId: rootGetters['auth/userId']
      })
    }
  }
}
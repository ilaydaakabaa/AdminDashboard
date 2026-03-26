const DATABASE_URL = import.meta.env.VITE_FIREBASE_DATABASE_URL

export default {
  namespaced: true,

  state() {
    return {
      tasks: [],
      assignedByMeTasks: [],
      users: []
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
    },
    setUsers(state, payload) {
      state.users = payload
    },
    setAssignedByMeTasks(state, payload) {
      state.assignedByMeTasks = payload
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
    },
    myTasks: (state, getters, rootState) => {
      return state.tasks.filter(task => task.assignedUserId === rootState.auth.userId)
    },
    myTasksSortedByDeadline: (state, getters) => {
      return [...getters.myTasks].sort((a, b) => {
        const aTime = a.deadline ? new Date(a.deadline).getTime() : Number.POSITIVE_INFINITY
        const bTime = b.deadline ? new Date(b.deadline).getTime() : Number.POSITIVE_INFINITY
        return aTime - bTime
      })
    },
    assignedByMeTasks(state) {
      return state.assignedByMeTasks
    },
    assignedByMeTasksSortedByDeadline(state) {
      return [...state.assignedByMeTasks].sort((a, b) => {
        const aTime = a.deadline ? new Date(a.deadline).getTime() : Number.POSITIVE_INFINITY
        const bTime = b.deadline ? new Date(b.deadline).getTime() : Number.POSITIVE_INFINITY
        return aTime - bTime
      })
    },
    users(state) {
      return state.users
    }
  },

  actions: {
    async fetchAssignedByMeTasks({ commit }, payload) {
      const response = await fetch(
        `${DATABASE_URL}/tasks.json?auth=${payload.token}`
      )

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error('Atadiginiz gorevler alinamadi.')
      }

      const loadedTasks = []

      if (responseData) {
        for (const assignedUserId in responseData) {
          const userTasks = responseData[assignedUserId]

          for (const key in userTasks) {
            const task = userTasks[key]

            if (task.assignedById === payload.userId) {
              loadedTasks.push({
                id: key,
                title: task.title,
                description: task.description,
                status: task.status,
                assignedUserId: task.assignedUserId,
                assignedById: task.assignedById,
                assignedByEmail: task.assignedByEmail,
                createdBy: task.createdBy,
                deadline: task.deadline
              })
            }
          }
        }
      }

      commit('setAssignedByMeTasks', loadedTasks)
    },
    async fetchUsers({ commit }, payload) {
      const response = await fetch(
        `${DATABASE_URL}/users.json?auth=${payload.token}`
      )

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error('Kullanıcılar alınamadı.')
      }

      const loadedUsers = []

      if (responseData) {
        for (const key in responseData) {
          loadedUsers.push({
            id: key,
            email: responseData[key].email
          })
        }
      }

      commit('setUsers', loadedUsers)
    },
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
            status: responseData[key].status,
            assignedUserId: responseData[key].assignedUserId,
            assignedById: responseData[key].assignedById,
            assignedByEmail: responseData[key].assignedByEmail,
            createdBy: responseData[key].createdBy,
            deadline: responseData[key].deadline
          })
        }
      }

      commit('setTasks', loadedTasks)
    },

    async addTask({ commit }, payload) {
      const response = await fetch(
        `${DATABASE_URL}/tasks/${payload.assignedUserId}.json?auth=${payload.token}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: payload.title,
            description: payload.description,
            status: payload.status,
            assignedUserId: payload.assignedUserId,
            assignedById: payload.assignedById,
            assignedByEmail: payload.assignedByEmail,
            createdBy: payload.userId,
            deadline: payload.deadline
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
        status: payload.status,
        assignedUserId: payload.assignedUserId,
        assignedById: payload.assignedById,
        assignedByEmail: payload.assignedByEmail,
        deadline: payload.deadline
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
        `${DATABASE_URL}/tasks/${payload.assignedUserId}/${payload.id}.json?auth=${payload.token}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: payload.title,
            description: payload.description,
            status: payload.status,
            assignedUserId: payload.assignedUserId,
            deadline: payload.deadline
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
        status: payload.status,
        assignedUserId: payload.assignedUserId,
        deadline: payload.deadline
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
        assignedUserId: task.assignedUserId,
        deadline: task.deadline,
        token: rootGetters['auth/token'],
        userId: rootGetters['auth/userId']
      })
    }
  }
}
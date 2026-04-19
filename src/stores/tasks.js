const DATABASE_URL = import.meta.env.VITE_FIREBASE_DATABASE_URL

function createColumnId(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

export default {
  namespaced: true,

  state() {
    return {
      tasks: [],
      columns: [],
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
    updateTask(state, payload) {
      const taskIndex = state.tasks.findIndex(task => task.id === payload.id)

      if (taskIndex !== -1) {
        state.tasks[taskIndex] = {
          ...state.tasks[taskIndex],
          ...payload
        }
      }
    },
    removeTask(state, taskId) {
      state.tasks = state.tasks.filter(task => task.id !== taskId)
    },
    setUsers(state, payload) {
      state.users = payload
    },
    setColumns(state, payload) {
      state.columns = payload
    },
    addColumn(state, payload) {
      state.columns.push(payload)
    },
    updateColumn(state, payload) {
      const columnIndex = state.columns.findIndex(column => column.id === payload.id)

      if (columnIndex !== -1) {
        state.columns[columnIndex] = {
          ...state.columns[columnIndex],
          ...payload
        }
      }
    },
    removeColumn(state, columnId) {
      state.columns = state.columns.filter(column => column.id !== columnId)
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
      return state.tasks.filter(task => task.status === 'done')
    },
    pendingTasks(state) {
      return state.tasks.filter(task => task.status !== 'done')
    },
    getTaskById: (state) => (taskId) => {
      return state.tasks.find(task => task.id === taskId)
    },
    myTasks: (state, getters, rootState) => {
      return state.tasks.filter(task => task.assignedUserId === rootState.auth.userId)
    },
    tasksByColumn: (state) => (columnId) => {
      return [...state.tasks]
        .filter(task => task.status === columnId)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    },
    myTasksSortedByDeadline: (state, getters) => {
      return [...getters.myTasks].sort((a, b) => {
        const aTime = a.deadline ? new Date(a.deadline).getTime() : Number.POSITIVE_INFINITY
        const bTime = b.deadline ? new Date(b.deadline).getTime() : Number.POSITIVE_INFINITY
        return aTime - bTime
      })
    },
    productBacklogTasks(state) {
      return state.tasks.filter(task => task.status === 'product-backlog')
    },
    sprintBacklogTasks(state) {
      return state.tasks.filter(task => task.status === 'sprint-backlog')
    },
    testTasks(state) {
      return state.tasks.filter(task => task.status === 'test')
    },
    doneTasks(state) {
      return state.tasks.filter(task => task.status === 'done')
    },
    columns(state) {
      return [...state.columns].sort((a, b) => a.order - b.order)
    },
    gorevler(state) {
      return state.tasks.filter(task =>
        task.status === 'product-backlog' ||
        task.status === 'sprint-backlog' ||
        task.status === 'test'
      )
    },
    users(state) {
      return state.users
    }
  },

  actions: {
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

    async fetchColumns({ commit }, payload) {
      const response = await fetch(
        `${DATABASE_URL}/home/${payload.userId}/columns.json?auth=${payload.token}`
      )

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error('Kolonlar alınamadı.')
      }

      if (!responseData) {
        const defaultColumns = {
          'product-backlog': {
            id: 'product-backlog',
            title: 'Product Backlog',
            order: 1
          },
          'sprint-backlog': {
            id: 'sprint-backlog',
            title: 'Sprint Backlog',
            order: 2
          },
          'test': {
            id: 'test',
            title: 'Test',
            order: 3
          },
          'done': {
            id: 'done',
            title: 'Done',
            order: 4
          }
        }

        const createResponse = await fetch(
          `${DATABASE_URL}/home/${payload.userId}/columns.json?auth=${payload.token}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(defaultColumns)
          }
        )

        if (!createResponse.ok) {
          throw new Error('Varsayılan kolonlar oluşturulamadı.')
        }

        commit(
          'setColumns',
          Object.values(defaultColumns).sort((a, b) => a.order - b.order)
        )
        return
      }

      const loadedColumns = []

      for (const key in responseData) {
        loadedColumns.push({
          id: responseData[key].id,
          title: responseData[key].title,
          order: responseData[key].order
        })
      }

      loadedColumns.sort((a, b) => a.order - b.order)

      commit('setColumns', loadedColumns)
    },

    async fetchTasks({ commit }, payload) {
      const response = await fetch(
        `${DATABASE_URL}/home/${payload.userId}/tasks.json?auth=${payload.token}`
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
            status: responseData[key].status || 'product-backlog',
            assignedUserId: responseData[key].assignedUserId || '',
            assignedUserEmail: responseData[key].assignedUserEmail || '',
            assignedById: responseData[key].assignedById || '',
            assignedByEmail: responseData[key].assignedByEmail || '',
            deadline: responseData[key].deadline || '',
            order: responseData[key].order ?? 0,
            createdAt: responseData[key].createdAt ?? Date.now(),
            ownerUserId: responseData[key].ownerUserId || payload.userId
          })
        }
      }

      loadedTasks.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))

      commit('setTasks', loadedTasks)
    },

    async fetchVisibleTasks({ commit }, payload) {
      const response = await fetch(
        `${DATABASE_URL}/home.json?auth=${payload.token}`
      )

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error('Görevler alınamadı.')
      }

      const loadedTasks = []

      if (responseData) {
        for (const boardOwnerId in responseData) {
          const board = responseData[boardOwnerId]

          if (!board?.tasks) continue

          for (const taskId in board.tasks) {
            const task = board.tasks[taskId]
            const isOwnBoardTask = boardOwnerId === payload.userId
            const isAssignedToMe = task.assignedUserId === payload.userId

            if (isOwnBoardTask || isAssignedToMe) {
              loadedTasks.push({
                id: taskId,
                title: task.title,
                description: task.description,
                status: task.status || 'product-backlog',
                assignedUserId: task.assignedUserId || '',
                assignedUserEmail: task.assignedUserEmail || '',
                assignedById: task.assignedById || '',
                assignedByEmail: task.assignedByEmail || '',
                deadline: task.deadline || '',
                order: task.order ?? 0,
                createdAt: task.createdAt ?? Date.now(),
                ownerUserId: task.ownerUserId || boardOwnerId
              })
            }
          }
        }
      }

      loadedTasks.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))

      commit('setTasks', loadedTasks)
    },

    async addTask({ commit }, payload) {
      const targetUserId = payload.userId

      const response = await fetch(
        `${DATABASE_URL}/home/${targetUserId}/tasks.json?auth=${payload.token}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: payload.title,
            description: payload.description,
            status: payload.status || 'product-backlog',
            assignedUserId: payload.assignedUserId || '',
            assignedUserEmail: payload.assignedUserEmail || '',
            assignedById: payload.assignedById || '',
            assignedByEmail: payload.assignedByEmail || '',
            deadline: payload.deadline || '',
            order: payload.order ?? Date.now(),
            createdAt: Date.now(),
            ownerUserId: targetUserId
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
        status: payload.status || 'product-backlog',
        assignedUserId: payload.assignedUserId || '',
        assignedUserEmail: payload.assignedUserEmail || '',
        assignedById: payload.assignedById || '',
        assignedByEmail: payload.assignedByEmail || '',
        deadline: payload.deadline || '',
        order: payload.order ?? Date.now(),
        createdAt: Date.now(),
        ownerUserId: targetUserId
      })
    },

    async updateTaskDeadline({ commit }, payload) {
      const targetUserId = payload.ownerUserId || payload.userId

      const response = await fetch(
        `${DATABASE_URL}/home/${targetUserId}/tasks/${payload.id}.json?auth=${payload.token}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            deadline: payload.deadline || ''
          })
        }
      )

      if (!response.ok) {
        throw new Error('Deadline güncellenemedi.')
      }

      commit('updateTask', {
        id: payload.id,
        deadline: payload.deadline || ''
      })
    },

    async fetchTasksAssignedToMe({ commit }, payload) {
      const response = await fetch(
        `${DATABASE_URL}/home.json?auth=${payload.token}`
      )

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error('Sana atanan görevler alınamadı.')
      }

      const loadedTasks = []

      if (responseData) {
        for (const boardOwnerId in responseData) {
          const board = responseData[boardOwnerId]

          if (!board?.tasks) continue

          for (const taskId in board.tasks) {
            const task = board.tasks[taskId]

            if (task.assignedUserId === payload.userId) {
              loadedTasks.push({
                id: taskId,
                title: task.title,
                description: task.description,
                status: task.status || 'product-backlog',
                assignedUserId: task.assignedUserId || '',
                assignedUserEmail: task.assignedUserEmail || '',
                assignedById: task.assignedById || '',
                assignedByEmail: task.assignedByEmail || '',
                deadline: task.deadline || '',
                order: task.order ?? 0,
                createdAt: task.createdAt ?? Date.now(),
                ownerUserId: task.ownerUserId || boardOwnerId
              })
            }
          }
        }
      }

      loadedTasks.sort((a, b) => {
        const aTime = a.deadline ? new Date(a.deadline).getTime() : Number.POSITIVE_INFINITY
        const bTime = b.deadline ? new Date(b.deadline).getTime() : Number.POSITIVE_INFINITY
        return aTime - bTime
      })

      commit('setTasks', loadedTasks)
    },

    async editTask({ commit }, payload) {
      const targetUserId = payload.ownerUserId || payload.userId

      const response = await fetch(
        `${DATABASE_URL}/home/${targetUserId}/tasks/${payload.id}.json?auth=${payload.token}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: payload.title,
            description: payload.description,
            status: payload.status,
            assignedUserId: payload.assignedUserId || '',
            assignedUserEmail: payload.assignedUserEmail || '',
            assignedById: payload.assignedById || '',
            assignedByEmail: payload.assignedByEmail || '',
            deadline: payload.deadline || '',
            order: payload.order ?? 0,
            ownerUserId: targetUserId
          })
        }
      )

      if (!response.ok) {
        throw new Error('Görev güncellenemedi.')
      }

      commit('updateTask', {
        id: payload.id,
        title: payload.title,
        description: payload.description,
        status: payload.status,
        assignedUserId: payload.assignedUserId || '',
        assignedUserEmail: payload.assignedUserEmail || '',
        assignedById: payload.assignedById || '',
        assignedByEmail: payload.assignedByEmail || '',
        deadline: payload.deadline || '',
        order: payload.order ?? 0,
        ownerUserId: targetUserId
      })
    },

    async deleteTask({ commit }, payload) {
      const targetUserId = payload.ownerUserId || payload.userId

      const response = await fetch(
        `${DATABASE_URL}/home/${targetUserId}/tasks/${payload.taskId}.json?auth=${payload.token}`,
        {
          method: 'DELETE'
        }
      )

      if (!response.ok) {
        throw new Error('Görev silinemedi.')
      }

      commit('removeTask', payload.taskId)
    },

    async moveTaskToColumn({ dispatch, getters }, payload) {
      const task = getters.getTaskById(payload.taskId)

      if (!task) {
        throw new Error('Görev bulunamadı.')
      }

      await dispatch('editTask', {
        id: task.id,
        title: task.title,
        description: task.description,
        status: payload.newColumnId,
        assignedUserId: task.assignedUserId,
        assignedUserEmail: task.assignedUserEmail || '',
        assignedById: task.assignedById,
        assignedByEmail: task.assignedByEmail,
        deadline: task.deadline || '',
        order: payload.newOrder ?? Date.now(),
        userId: payload.userId,
        token: payload.token,
        ownerUserId: task.ownerUserId || payload.userId
      })
    },

    async addColumn({ commit }, payload) {
      const columnId = payload.id
      const response = await fetch(
        `${DATABASE_URL}/home/${payload.userId}/columns/${columnId}.json?auth=${payload.token}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id: payload.id,
            title: payload.title,
            order: payload.order
          })
        }
      )

      if (!response.ok) {
        throw new Error('Sütun eklenemedi.')
      }

      commit('addColumn', {
        id: payload.id,
        title: payload.title,
        order: payload.order
      })
    },

    async deleteColumn({ commit }, payload) {
      const response = await fetch(
        `${DATABASE_URL}/home/${payload.userId}/columns/${payload.columnId}.json?auth=${payload.token}`,
        {
          method: 'DELETE'
        }
      )

      if (!response.ok) {
        throw new Error('Sütun silinemedi.')
      }

      commit('removeColumn', payload.columnId)
    }
  }
}
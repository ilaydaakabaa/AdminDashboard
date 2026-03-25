import { createStore } from 'vuex'
import auth from './auth'
import tasks from './tasks'
const store = createStore({
  modules: {
    auth,
    tasks
  }
})

export default store
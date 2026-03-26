const API_KEY = import.meta.env.VITE_FIREBASE_API_KEY
const DATABASE_URL = import.meta.env.VITE_FIREBASE_DATABASE_URL

async function syncUserProfile(userId, email, token) {
  const profileResponse = await fetch(
    `${DATABASE_URL}/users/${userId}.json?auth=${token}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email
      })
    }
  )

  if (!profileResponse.ok) {
    throw new Error('Kullanıcı profili eşitlenemedi.')
  }
}

function calculateExpirationTime(expiresIn) {
  return new Date().getTime() + Number(expiresIn) * 1000
}

export default {
  namespaced: true,
  state() {
    return {
      userId: null,
      token: null,
      email: null,
      refreshToken: null
    };
  },
  mutations: {
    setUser(state, payload) {
      state.userId = payload.userId;
      state.email = payload.email || null;
      state.token = payload.token;
      state.refreshToken = payload.refreshToken;

    },
    clearUser(state) {
      state.userId = null;
      state.token = null;
      state.email = null;
      state.refreshToken = null;
    }
  },

  getters: {
    userId(state) {
      return state.userId;
    },
    token(state) {
      return state.token;
    },
    isAuthenticated(state) {
      return !!state.token;
    },
    email(state) {
      return state.email;
    },
    refreshToken(state) {
      return state.refreshToken;
    }


  },

  actions: {
    async register({ commit }, payload) {
      const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: payload.email,
            password: payload.password,
            returnSecureToken: true
          })
        }
      )
      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.error.message || 'Failed to register.')
      }

      const expirationTime = calculateExpirationTime(responseData.expiresIn)

      localStorage.setItem('token', responseData.idToken)
      localStorage.setItem('userId', responseData.localId)
      localStorage.setItem('email', responseData.email)
      localStorage.setItem('refreshToken', responseData.refreshToken)
      localStorage.setItem('tokenExpiration', expirationTime)

      commit('setUser', {
        userId: responseData.localId,
        email: responseData.email,
        token: responseData.idToken,
        refreshToken: responseData.refreshToken,
        tokenExpiration: expirationTime
      })

      await syncUserProfile(responseData.localId, responseData.email, responseData.idToken)

    },
    async login({ commit }, payload) {
      const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: payload.email,
            password: payload.password,
            returnSecureToken: true
          })
        }
      )
      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.error.message || 'Failed to login.')
      }

      const expirationTime = calculateExpirationTime(responseData.expiresIn)

      localStorage.setItem('token', responseData.idToken)
      localStorage.setItem('userId', responseData.localId)
      localStorage.setItem('email', responseData.email)
      localStorage.setItem('refreshToken', responseData.refreshToken)
      localStorage.setItem('tokenExpiration', expirationTime)

      commit('setUser', {
        userId: responseData.localId,
        email: responseData.email,
        token: responseData.idToken,
        refreshToken: responseData.refreshToken,
        tokenExpiration: expirationTime
      })

      // Profil bilgilerini güncelleyerek, bu özellikten önce oluşturulan kullanıcıların da atananlar listesinde görünmesini sağlıyoruz
      await syncUserProfile(responseData.localId, responseData.email, responseData.idToken)

    },
    logout({ commit }) {
      localStorage.removeItem('token')
      localStorage.removeItem('userId')
      localStorage.removeItem('email')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('tokenExpiration')

      commit('clearUser')
    },

    tryLogin ({commit}) { ///login ve trylogin içinde timer başlatıp   yeni bi auto logout actionu oluşturup token süresi dolunca otomatik logout
      const token = localStorage.getItem('token')
      const userId = localStorage.getItem('userId')
      const email = localStorage.getItem('email')
      const refreshToken = localStorage.getItem('refreshToken')
      const tokenExpiration = localStorage.getItem('tokenExpiration')

      if(!token || !userId ||  !tokenExpiration) {
        return
      }
      const expirationTime = Number(tokenExpiration) 
      const now = new Date().getTime()

      if (now >= expirationTime) {
        localStorage.removeItem('token')
        localStorage.removeItem('userId')
        localStorage.removeItem('email')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('tokenExpiration')
        commit('clearUser')
        return
      }

      commit('setUser', {
        userId: userId,
        email: email,
        token: token,
        refreshToken: refreshToken,
        tokenExpiration: tokenExpiration
      })
    }
  }
}
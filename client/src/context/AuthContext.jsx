import { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import { authService, userService } from '../services'

const AuthContext = createContext(null)

const initialState = {
  user: null,
  token: localStorage.getItem('accessToken') || null,
  loading: true,
  error: null,
}

function authReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'LOGIN_SUCCESS':
      return { ...state, user: action.payload.user, token: action.payload.token, loading: false, error: null }
    case 'UPDATE_USER':
      return { ...state, user: action.payload }
    case 'LOGOUT':
      return { ...initialState, loading: false, token: null }
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false }
    default:
      return state
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // On mount — rehydrate user from stored token
  useEffect(() => {
    const init = async () => {
      if (!state.token) {
        dispatch({ type: 'SET_LOADING', payload: false })
        return
      }
      try {
        const { data } = await userService.getMe()
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user: data.data.user, token: state.token },
        })
      } catch {
        localStorage.removeItem('accessToken')
        dispatch({ type: 'LOGOUT' })
      }
    }
    init()
  }, []) // eslint-disable-line

  const login = useCallback(async (credentials) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    const { data } = await authService.login(credentials)
    localStorage.setItem('accessToken', data.accessToken)
    dispatch({
      type: 'LOGIN_SUCCESS',
      payload: { user: data.data.user, token: data.accessToken },
    })
    return data
  }, [])

  const signup = useCallback(async (credentials) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    const { data } = await authService.signup(credentials)
    localStorage.setItem('accessToken', data.accessToken)
    dispatch({
      type: 'LOGIN_SUCCESS',
      payload: { user: data.data.user, token: data.accessToken },
    })
    return data
  }, [])

  const logout = useCallback(async () => {
    try { await authService.logout() } catch { /* ignore */ }
    localStorage.removeItem('accessToken')
    dispatch({ type: 'LOGOUT' })
  }, [])

  const updateUser = useCallback((user) => {
    dispatch({ type: 'UPDATE_USER', payload: user })
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
